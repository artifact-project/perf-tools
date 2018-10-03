export type Entry = {
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
const s_mark = 'mark';
const s_measure = 'measure';
const s_clearMarks = 'clearMarks';
const s_clearMeasures = 'clearMeasures';

// Polyfill
nativePerf.now = nativePerf.now
	|| nativePerf.webkitNow
	|| nativePerf.mozNow
	|| nativePerf.msNow
	|| (() => (dateNow() - startOffset))
;

export type KeeperOptions = {
	silent: boolean;
	print: boolean;
	prefix: string;
	perf: Partial<Performance>;
	console: Partial<Console>;
	timeline: boolean;
	warn: (msg: string) => void;
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

function has<T extends object>(target: T, key: keyof T): boolean {
	return target.hasOwnProperty(key)
}

export function create(options: Partial<KeeperOptions>) {
	const perf = options.perf || nativePerf;
	const prefix = options.prefix || '';
	const silent = options.silent === true;
	const console = options.console || nativeConsole;
	const warn = options.warn || console.warn && console.warn.bind(console);

	// Private
	const perfSupported = !!(
		perf[s_mark]
		&& perf[s_measure]
		&& perf[s_clearMarks]
		&& perf[s_clearMeasures]
	) && options.timeline;
	const entries: Entry[] = [];
	const entriesIndex: {[name:string]: Entry[]} = {};

	let cid = 0;
	let activeEntry: Entry = nil;
	let lock = false;
	let label: string;
	let mark;

	function measure(entry: Entry) {
		mark = entry[s_mark];
		label = `${prefix}${entry.name}`;

		perf[s_measure](label, mark);
		perf[s_clearMarks](mark);
		perf[s_clearMeasures](label);
	}

	function __print__(entries: Entry[]) {
		let i = 0;
		let total = 0;
		let entry: Entry;
		let duration: number;
		let selfDuration: number;
		let logMsg: string;
		let nextEntries: Entry[];
		let nextLength: number;

		for (; i < entries.length; i++) {
			entry = entries[i];

			if (entry.end && !entry.active) {
				duration = entry.end - entry.start;
				logMsg = `${prefix}${entry.name}: %c${duration.toFixed(3)}ms`;
				nextEntries = entry.entries;
				nextLength = nextEntries ? nextEntries.length : 0

				if (nextLength < 1) {
					console.log(
						logMsg,
						`${BOLD};${color(duration)}`,
					);

					total += duration;
				} else {
					console[
						console.groupCollapsed && nextLength < 2
							? 'groupCollapsed'
							: 'group'
					](
						logMsg,
						color(duration),
					);
					selfDuration = duration - __print__(nextEntries);

					if (selfDuration > 3) {
						console.log(
							`${prefix}[[self]]: %c${selfDuration.toFixed(3)}ms`,
							`${BOLD};${color(selfDuration)}`,
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
		if (silent) {
			return {} as Entry;
		}

		label = `${prefix}${name}-${++cid}`;

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
			if (!has(entriesIndex, name)) {
				entriesIndex[name] = [];
			}

			entriesIndex[name].push(entry);
		}

		perfSupported && perf[s_mark](entry[s_mark]);

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
			if (silent) {
				return;
			}

			if (has(entriesIndex, name)) {
				const entries = entriesIndex[name];
				let idx = entries.length;
				let entry: Entry;

				while (idx--) {
					entry = entries[idx];

					if (entry.end === 0) {
						entry.end = perf.now();

						perfSupported && measure(entry);
						closeGroup(entry.parent);

						return;
					}
				}
			}

			warn && warn(`[timekeeper] Timer "${name}" doesn't exist`);
		},

		group(name: string) {
			createEntry(name, true).active = 1;
		},

		groupEnd(name?: string) {
			if (silent || activeEntry === nil) {
				!silent && warn && warn(`[timekeeper] No active groups`);
				return;
			}

			if (name != nil && activeEntry.name !== name) {
				warn && warn(`[timekeeper] Wrong group "${name}" (actual: "${activeEntry.name}")`);
			}

			closeGroup(activeEntry);
			activeEntry = activeEntry.parent;
		},

		wrap<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R {
			if (silent) {
				return fn;
			}

			const group = activeEntry;
			let retVal: R;

			group.active++;

			return function () {
				const _activeEntry = activeEntry;

				activeEntry = group;
				retVal = fn.apply(this, arguments);
				closeGroup(group);
				activeEntry = _activeEntry;
				return retVal;
			};
		},
	};
}