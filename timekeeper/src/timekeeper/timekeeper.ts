type Entry = {
	mark: string;
	name: string;
	parent: Entry;
	entries: Entry[];
	active: number;
	start: number;
	end: number;

}

const nil = null;
const BOLD = 'font-weight: bold';
const global = Function('return this')() as Window & {Date: DateConstructor};
const Date = global.Date;
const dateNow = Date.now || (() => new Date().getTime());
const startOffset = dateNow();
const nativeConsole = global.console;
const nativePerf = (global.performance || {}) as Performance & {
	webkitNow(): number;
	mozNow(): number;
	msNow(): number;
};

// Polyfill
nativePerf.now = nativePerf.now
	|| nativePerf.webkitNow
	|| nativePerf.mozNow
	|| nativePerf.msNow
	|| (() => (dateNow() - startOffset))
;

export type KeeperOptions = {
	print: boolean;
	prefix: string;
	perf: Partial<Performance>;
	console: Partial<Console>;
	timeline: boolean;
}

function color(ms: any): string {
	return 'color: #' + (
		ms < 2 ? 'ccc' :
		ms < 5 ? '666' :
		ms < 10 ? '333' :
		ms < 30 ? 'f90' :
		ms < 60 ? 'f60' :
		'f00'
	);
}

export function create(options: Partial<KeeperOptions>) {
	function opt<N extends keyof KeeperOptions>(name: N, def: KeeperOptions[N]): KeeperOptions[N] {
		return options[name] == nil ? def : options[name];
	}

	const perf = opt('perf', nativePerf);
	const prefix = opt('prefix', '[tk] ');
	const console = opt('console', nativeConsole);

	// Private
	const perfSupported = !!(perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) && options.timeline;
	const entries: Entry[] = [];
	const entriesIndex: {[name:string]: Entry[]} = {};

	let cid = 0;
	let activeEntry: Entry = nil;
	let lock = false;

	function measure(entry: Entry) {
		const label = `${prefix}${entry.name}`;

		perf.measure(label, entry.mark);
		perf.clearMarks(entry.mark);
		perf.clearMeasures(label);
	}

	function __print__(entries: Entry[]) {
		let total = 0;

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];

			if (entry.end && !entry.active) {
				const duration = (entry.end - entry.start);
				const msg = `${prefix}${entry.name}: %c${duration.toFixed(3)}ms`;

				if (entry.entries === nil || entry.entries.length < 1) {
					console.log(
						msg,
						`${BOLD};${color(duration)}`,
					);

					total += duration;
				} else {
					console[
						console.groupCollapsed && entry.entries.length < 2
							? 'groupCollapsed'
							: 'group'
					](
						msg,
						color(duration),
					);
					const selfDur = duration - __print__(entry.entries);

					if (selfDur > 3) {
						console.log(
							`${prefix}[[self]]: %c${selfDur.toFixed(3)}ms`,
							`${BOLD};${color(selfDur)}`,
						);
					}

					total += duration;
					console.groupEnd();
				}

				if (entry.parent === nil) {
					entries.splice(i, 1);
					i--;
				}
			}
		}

		lock = false;
		return total;
	}

	function printDefered() {
		__print__(entries);
	}

	function print() {
		if (lock === false) {
			lock = true;
			(global.requestAnimationFrame || setTimeout)(printDefered);
		}
	}

	function createEntry(name, isGroup: boolean) {
		const label = `${prefix}${name}-${++cid}`;
		const entry = {
			mark: `${label}-mark`,
			name,
			parent: activeEntry,
			entries:  nil,
			active: 0,
			start: perf.now(),
			end: 0,
		};

		if (activeEntry !== nil) {
			activeEntry.active++;
			activeEntry.entries.push(entry);
		} else {
			entries.push(entry);
		}

		if (isGroup) {
			entry.entries = [];
			activeEntry = entry;
		} else {
			if (!entriesIndex.hasOwnProperty(name)) {
				entriesIndex[name] = [];
			}

			entriesIndex[name].push(entry);
		}

		perfSupported && perf.mark(entry.mark);

		return entry;
	}

	function closeGroup(entry: Entry) {
		options.print && print();

		if (entry === nil) {
			//
		} else if (entry.active > 0) {
			(--entry.active === 0) && closeGroup(entry);
		} else {
			entry.end = perf.now();
			perfSupported && measure(entry);
			closeGroup(entry.parent);
		}
	}

	// Public
	return {
		entries,

		time(name: string) {
			createEntry(name, false);
		},

		timeEnd(name: string) {
			if (entriesIndex.hasOwnProperty(name)) {
				const entries = entriesIndex[name];
				let idx = entries.length;

				while (idx--) {
					const entry = entries[idx];

					if (entry.end === 0) {
						entry.end = perf.now();

						perfSupported && measure(entry);
						closeGroup(entry.parent);

						return;
					}
				}
			}

			console.warn(`[timekeeper] Timer "${name}" doesn't exist`);
		},

		group(name: string) {
			createEntry(name, true).active = 1;
		},

		groupEnd(name?: string) {
			const entry = activeEntry;

			if (entry === nil) {
				console.warn(`[timekeeper] No active groups`);
				return;
			}

			if (name != nil && entry.name !== name) {
				console.warn(`[timekeeper] Wrong group "${name}" (actual: "${entry.name}")`);
			}

			closeGroup(entry);
			activeEntry = entry.parent;
		},

		wrap<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R {
			const group = activeEntry;

			group.active++;

			return function () {
				const _activeEntry = activeEntry;

				activeEntry = group;

				const retVal = fn.apply(this, arguments);
				closeGroup(group);
				activeEntry = _activeEntry;
				return retVal;
			};
		},
	};
}