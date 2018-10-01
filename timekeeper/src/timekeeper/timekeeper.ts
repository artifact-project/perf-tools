type Entry = {
	mark: string;
	measure: string;
	name: string;
	parent: Entry;
	entries: Entry[];
	active: number;
	start: number;
	end: number;

}

const dateNow = Date.now || (() => new Date().getTime());
const startOffset = dateNow();
const global = Function('return this')() as Window;
const nativeConsole = global.console;
const nativePerf = (global.performance || {}) as Performance & {
	webkitNow(): number;
	mozNow(): number;
	msNow(): number;
};

// Polyfill
nativePerf.now = nativePerf.now || nativePerf.webkitNow || nativePerf.mozNow || nativePerf.msNow || (() => (dateNow() - startOffset));

export type KeeperOptions = {
	print: boolean;
	prefix: string;
	perf: Partial<Performance>;
	console: Partial<Console>;
	timeline: boolean;
}

export function create(options: Partial<KeeperOptions>) {
	const perf = options.perf == null ? nativePerf : options.perf;
	const console = options.console == null ? nativeConsole : options.console;

	// Private
	const perfSupported = !!(perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) && options.timeline;
	const entries: Entry[] = [];
	const entriesIndex: {[name:string]: Entry[]} = {};

	let cid = 0;
	let activeEntry: Entry = null;
	let lock = false;

	function __print__(entries: Entry[]) {
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const duration = (entry.end - entry.start).toFixed(3);

			if (entry.end) {
				if (entry.entries === null) {
					console.log(
						`%c${entry.measure}: %c${duration}ms`,
						'font-weight: bold',
						'color: #060',
					);
				} else {
					console.group(`${entry.measure}: ${duration}ms`);
					__print__(entry.entries);
					console.groupEnd();
				}

				if (entry.parent === null) {
					entries.splice(i, 1);
					i--;
				}
			}
		}

		lock = false;
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
		const entry = {
			mark: `[tk] ${name} ${cid}`,
			measure: `[tk] ${name}`,
			name,
			parent: activeEntry,
			entries:  null,
			active: 0,
			start: perf.now(),
			end: 0,
		};

		if (activeEntry !== null) {
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

	function closeGroup(entry: Entry, dec: boolean) {
		options.print && print();

		if (entry === null) {
			//
		} else if (entry.active > 0) {
			if (dec && --entry.active === 0) {
				closeGroup(entry, false);
			}
		} else {
			entry.end = perf.now();

			if (perfSupported) {
				perf.measure(entry.measure, entry.mark);
				perf.clearMarks(entry.mark);
				perf.clearMeasures(entry.measure);
			}

			closeGroup(entry.parent, true);
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
						closeGroup(entry.parent, true);

						return;
					}
				}
			}

			console.warn(`[timekeeper] Timer "${name}" doesn't exist`);
		},

		group<R>(name: string, executer?: (grouper: <GR>(callback: () => GR) => GR) => R) {
			const entry = createEntry(name, true);

			if (executer != null) {
				entry.active = 1;

				const retVal = executer((callback) => {
					const _activeEntry = activeEntry;
					activeEntry = entry;
					const retVal = callback();
					closeGroup(entry, true);
					activeEntry = _activeEntry;
					return retVal;
				});

				activeEntry = entry.parent;
				return retVal
			}
		},

		groupEnd(name?: string) {
			const entry = activeEntry;

			if (entry === null) {
				console.warn(`[timekeeper] No active groups`);
				return;
			}

			if (name != null && entry.name !== name) {
				console.warn(`[timekeeper] Wrong group "${name}" (actual: "${entry.name}")`);
			}

			closeGroup(entry, false);
			activeEntry = entry.parent;
		}
	};
}