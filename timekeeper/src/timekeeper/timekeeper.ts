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

export type Entry = {
	id: string;
	name: string;
	parent: GroupEntry;
	entries: Entry[];
	active: number;
	start: number;
	end: number;
	stop: (end?: number) => void;
}

export type GroupEntry = Entry & {
	add: TimeKeeper['add'];
	time: TimeKeeper['time'];
	group: (name: string, start?: number) => GroupEntry;
	mark: (name: string) => void;
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

export type TimeKeeper = {
	readonly entries: Entry[];

	print(): void;
	listen(fn: (entry: Entry) => void): void;
	disable(state: boolean): void;

	add(name: string, start: number, end: number): void;
	time(name: string): Entry;
	timeEnd(name: string): void;

	group(name: string, isolate: true): GroupEntry;
	group(name: string, start?: number): GroupEntry;
	group(name: string, start: number, isolate: true): GroupEntry;
	groupEnd(name?: string, end?: number): void;
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
	const activeEntries: Entry[] = [];
	const activeGroups: GroupEntry[] = [];
	let api: TimeKeeper;

	let cid = 0;
	let lock = false;

	function disable(state: boolean) {
		disabled = state;
	}

	function listen(fn: (entry: Entry) => void) {
		listener = fn;
		let idx = emitEntries.length;
		while (idx--) {
			fn(emitEntries[idx]);
		}
		emitEntries.length = 0;
	}

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

	function measure(entry: Entry) {
		let id = entry.id;
		let label = `${prefix}${entry.name}`;

		perf[s_measure](label, id);
		perf[s_clearMarks](id);
		perf[s_clearMeasures](label);
	}

	function __print__(entries: Entry[]) {
		let i = 0;
		let total = 0;
		let start: number;
		let entry: Entry;
		let duration: number;
		let selfDuration: number;
		let logMsg: string;
		let nextEntries: Entry[];
		let nextLength: number;

		for (; i < entries.length; i++) {
			entry = entries[i];

			if (entry.end !== nil && !entry.active) {
				nextEntries = entry.entries;
				nextLength = nextEntries ? nextEntries.length : 0;

				start = entry.start;
				duration = entry.end - start;
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
						emit(createEntry(
							'[[unknown]]',
							entry as GroupEntry,
							false,
							start,
							start + selfDuration,
						));
						console.log(
							`${prefix}[[unknown]]: %c${selfDuration.toFixed(3)}ms`,
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

	function createEntry(
		name: string,
		parent: GroupEntry | null,
		isGroup: boolean,
		start?: number,
		end?: number,
		isolate?: true,
	): Entry | GroupEntry {
		let label = `${prefix}${name}-${++cid}`;
		let id = `${label}-mark`;

		if ((parent as any) === api) {
			parent = activeGroups[0] || nil;
		}

		const entry: Entry | GroupEntry = {
			id,
			name,
			parent,
			entries:  isGroup ? [] : nil,
			active: +isGroup,
			start: start != nil ? start : perf.now(),
			end: end != nil ? end : nil,
			stop: isGroup ? stopGroup : stopEntry,
		};

		if (parent === nil) {
			!disabled && entries.push(entry);
		} else if (parent.end !== nil && end == nil) {
			warn(`[timekeeper] Group "${parent.name}" is stopped`);
		} else if (!disabled) {
			parent.active++;
			parent.entries.push(entry);
		}

		if (isGroup) {
			(entry as GroupEntry).add = add;
			(entry as GroupEntry).time = time;
			(entry as GroupEntry).group = group;
			(entry as GroupEntry).mark = groupMark;
			!disabled && !isolate && activeGroups.unshift(entry as GroupEntry);
		} else {
			!disabled && activeEntries.push(entry);
		}

		!disabled && (start == nil) && perfSupported && perf[s_mark](id);

		return entry;
	}

	function stopEntry(this: Entry, end?: number) {
		if (this.end === nil) {
			this.end = end >= 0 ? end : perf.now();

			(end == nil) && perfSupported && measure(this);
			emit(this);
			closeGroup(this.parent, end);
		}
		return this;
	}

	function stopGroup(this: GroupEntry, end?: number) {
		groupStopAll(this);
		closeGroup(this, end);
		return this;
	}

	function closeGroup(entry: GroupEntry, end?: number) {
		needPrint && print();

		if (entry !== nil) {
			if (entry.active > 0) {
				(--entry.active === 0) && closeGroup(entry, end);
			} else if (entry.end === nil) {
				let idx = activeGroups.indexOf(entry);
				(idx > -1) && activeGroups.splice(idx, 1);

				entry.end = end >= 0 ? end : perf.now();
				(end == nil) && perfSupported && measure(entry);
				emit(this);
				closeGroup(entry.parent, end);
			}
		}
	}

	function add(this: GroupEntry, name: string, start: number, end: number) {
		if (start >= 0 && start <= end) {
			createEntry(name, this, false, start).stop(end);
		}
	}

	function time(this: GroupEntry, name: string) {
		return createEntry(name, this, false);
	}

	function timeEnd(name: string) {
		if (!disabled) {
			let idx = activeEntries.length;
			let entry: Entry;

			while (idx--) {
				entry = activeEntries[idx];

				if (entry.name === name) {
					entry.stop();
					activeEntries.splice(idx, 1);
					return;
				}
			}

			warn && warn(`[timekeeper] Timer "${name}" doesn't exist`);
		}
	}

	function groupStopAll(group: GroupEntry) {
		let entries = group.entries;
		let idx = entries.length;
		while (idx--) {
			entries[idx].stop();
		}
	}

	function groupMark(this: GroupEntry, name: string) {
		groupStopAll(this);
		this.time(name);
	}

	function group(this: GroupEntry, name: string, start?: number | true, isolate?: true): GroupEntry {
		if (start === true) {
			isolate = start;
			start = nil;
		}

		return createEntry(
			name,
			isolate ? nil : this,
			true,
			start as number,
			nil,
			isolate,
		) as GroupEntry;
	}

	function groupEnd(name: string, end?: number): void {
		for (let i = 0; i < activeGroups.length; i++) {
			if (name == nil || activeGroups[i].name === name) {
				activeGroups[i].stop(end);
				return;
			}
		}

		warn(`[timekeeper] Group "${name}" not found`);
	}

	// Public API
	return (api = {
		entries,
		print,
		disable,
		listen,
		add,
		time,
		timeEnd,
		group,
		groupEnd,
	});
};

export const system = globalThis.timekeeper ? globalThis.timekeeper.system : create({
	print: /^(file:|https?:\/\/localhost)/.test(globalThis.location + ''),
	timeline: true,
	prefix: '⚡️',
});