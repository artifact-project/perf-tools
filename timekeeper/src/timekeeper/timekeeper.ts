const nil = null;
const BOLD = 'font-weight: bold;';
const globalThis = Function('return this')() as Window & {
	Date: DateConstructor;
	timekeeper?: {
		system: TimeKeeper;
	};
};
const Date = globalThis.Date;

const dateNow = Date.now || (() => new Date().getTime());
const startOffset = dateNow();

const nativeConsole = globalThis.console;
const nativePerf = (globalThis.performance || {}) as Performance & {
	webkitNow(): number;
	mozNow(): number;
	msNow(): number;
};

const s_group = 'group';
const s_groupCollapsed = 'groupCollapsed';
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

export type Entry = {
	mark: string;
	name: string;
	parent: Entry;
	entries: Entry[];
	active: number;
	start: number;
	end: number;
	close: (end?: number) => void;
}

export type KeeperOptions = {
	disabled: boolean;
	print: boolean;
	prefix: string;
	perf: Partial<Performance>;
	console: Partial<Console>;
	timeline: boolean;
	maxEntries: number;
	listener: (entry: Entry) => void;
	warn: (msg: string) => void;
}

export function color(ms: any): string {
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
	return target.hasOwnProperty(key);
}

export type TimeKeeper = {
	readonly entries: Entry[];

	print(): void;
	listen(fn: (entry: Entry) => void): void;
	disabled(state: boolean): void;

	add(name: string, start: number, end: number): void;
	time(name: string): Entry;
	timeEnd(name: string): void;

	group(name: string, start?: number): void;
	groupEnd(name?: string, end?: number): void;

	wrap<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R;
}

export function create(options: Partial<KeeperOptions>): TimeKeeper {
	const perf = options.perf || nativePerf;
	const prefix = options.prefix || '';
	const console = options.console || nativeConsole;
	const maxEntries = options.maxEntries == nil ? 1e3 : options.maxEntries;
	const warn = options.warn || console.warn && console.warn.bind(console);
	let needPrint = options.print;
	let disabled = options.disabled;
	let listener = options.listener;

	// Private
	const perfSupported = !!(
		options.timeline
		&& perf[s_mark]
		&& perf[s_measure]
		&& perf[s_clearMarks]
		&& perf[s_clearMeasures]
	);
	const entries: Entry[] = [];
	const emitEntries: Entry[] = [];
	const entriesIndex: {[name:string]: Entry[]} = {};

	let cid = 0;
	let activeEntry: Entry = nil;
	let lock = false;
	let label: string;
	let mark: string;

	function emit(entry: Entry) {
		if (listener) {
			listener(entry);
		} else {
			emitEntries.unshift(entry);
			if (emitEntries.length > maxEntries) {
				emitEntries.length = maxEntries;
			}
		}
	}

	function closeEntry(this: Entry, end?: number) {
		if (this.end === 0) {
			this.end = end >= 0 ? end : perf.now();

			perfSupported && measure(this);
			emit(this);
			closeGroup(this.parent, end);
		}
	}

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
				nextEntries = entry.entries;
				nextLength = nextEntries ? nextEntries.length : 0;

				if (entry.start === -1) {
					entry.start = nextEntries[0].start;
					entry.end = nextEntries[nextLength -1].end;
				}

				duration = entry.end - entry.start;
				logMsg = `${prefix}${entry.name}: %c${duration.toFixed(3)}ms`;

				if (nextLength < 1) {
					console.log(
						logMsg,
						`${BOLD}${color(duration)}`,
					);

					total += duration;
				} else {
					console[
						console[s_groupCollapsed] && nextLength < 2
							? s_groupCollapsed
							: s_group
					](
						logMsg,
						color(duration),
					);
					selfDuration = duration - __print__(nextEntries);

					if (selfDuration > 3) {
						console.log(
							`${prefix}[[self]]: %c${selfDuration.toFixed(3)}ms`,
							`${BOLD}${color(selfDuration)}`,
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

	function print(state?: boolean) {
		if (state != nil) {
			needPrint = state;
		} else if (lock === false) {
			lock = true;
			(globalThis.requestAnimationFrame || setTimeout)(printDefered);
		}
	}

	function createEntry(name: string, isGroup: boolean, start?: number) {
		if (disabled) {
			return {} as Entry;
		}

		label = `${prefix}${name}-${++cid}`;

		const entry = {
			mark: `${label}-mark`,
			name,
			parent: activeEntry,
			entries:  nil,
			active: 0,
			start: start >= 0 ? start : perf.now(),
			end: 0,
			close: closeEntry,
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
			!has(entriesIndex, name) && (entriesIndex[name] = []);
			entriesIndex[name].push(entry);
		}

		perfSupported && perf[s_mark](entry[s_mark]);

		return entry;
	}

	function closeGroup(entry: Entry, end?: number) {
		needPrint && print();

		if (entry !== nil) {
			if (entry.active > 0) {
				(--entry.active === 0) && closeGroup(entry, end);
			} else {
				entry.end = end >= 0 ? end : perf.now();
				perfSupported && measure(entry);
				emit(this);
				closeGroup(entry.parent, end);
			}
		}
	}

	// Public
	return {
		entries,
		print,

		disabled(state: boolean) {
			disabled = state;
		},

		listen(fn: (entry: Entry) => void) {
			listener = fn;

			let idx = emitEntries.length;
			while (idx--) {
				fn(emitEntries[idx]);
			}
			emitEntries.length = 0;
		},

		add(this: TimeKeeper, name: string, start: number, end: number) {
			if (start >= 0 && start <= end) {
				createEntry(name, false, start).close(end);
			}
		},

		time(name: string) {
			return createEntry(name, false);
		},

		timeEnd(name: string) {
			if (!disabled) {
				if (has(entriesIndex, name)) {
					const entries = entriesIndex[name];
					let idx = entries.length;
					let entry: Entry;

					while (idx--) {
						entry = entries[idx];

						if (entry.end === 0) {
							entry.close();
							return;
						}
					}
				}

				warn && warn(`[timekeeper] Timer "${name}" doesn't exist`);
			}
		},

		group(name: string, start?: number) {
			createEntry(name, true, start).active = 1;
		},

		groupEnd(name?: string, end?: number) {
			if (disabled || activeEntry === nil) {
				!disabled && warn && warn(`[timekeeper] No active groups`);
				return;
			}

			if (name != nil && activeEntry.name !== name) {
				warn && warn(`[timekeeper] Wrong group "${name}" (actual: "${activeEntry.name}")`);
			}

			closeGroup(activeEntry, end);
			activeEntry = activeEntry.parent;
		},

		wrap<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R {
			const group = activeEntry;
			let retVal: R;
			let wrapped = fn;

			if (!disabled) {
				group.active++;

				wrapped = function () {
					const _activeEntry = activeEntry;

					activeEntry = group;
					retVal = fn.apply(this, arguments);
					closeGroup(group);
					activeEntry = _activeEntry;
					return retVal;
				};
			}

			return wrapped;
		},
	};
};

export const system = globalThis.timekeeper ? globalThis.timekeeper.system : create({
	print: /^(file:|https?:\/\/localhost)/.test(globalThis.location + ''),
	timeline: true,
	prefix: '⚡️',
});