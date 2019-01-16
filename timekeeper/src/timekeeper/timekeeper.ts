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

export function color(ms: number, unit: Entry['unit']): string {
	ms /= unit === 'KiB' ? 5 : 1;

	return 'color: #' + (
		ms < 2 ? 'ccc' :
		ms < 5 ? '666' :
		ms < 10 ? '333' :
		ms < 30 ? 'f90' :
		ms < 60 ? 'f60' :
		'f00'
	);
}

export type Entry = {
	id: string;
	name: string;
	parent: GroupEntry;
	entries: Entry[];
	active: number;
	start: number;
	end: number;
	unit: 'ms' | 'KiB';
	stop: (end?: number) => void;
}

export type GroupEntry = Entry & {
	_?: true; // collapsed
	add: TimeKeeper['add'];
	time: TimeKeeper['time'];
	timeEnd: TimeKeeper['timeEnd'];
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
	analytics: Array<(entry: Entry) => void>;
	warn: (msg: string) => void;
}

export type TimeKeeper = {
	readonly entries: Entry[];
	readonly perf: Pick<Performance, 'now'>;

	print(): void;
	disable(state: boolean): void;
	setAnalytics(list: KeeperOptions['analytics']): void;

	add(name: string, start: number, end: number): void;
	time(name: string): Entry;
	time(name: string, executer: () => void): void;
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
	const warn = options.warn || console.warn && console.warn.bind(console);
	let analytics = options.analytics || [];
	let needPrint = options.print;
	let disabled = options.disabled;

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

	function setAnalytics(list: KeeperOptions['analytics']) {
		let idx = list.length;

		while (idx--) {
			let jdx = emitEntries.length;
			while (jdx--) {
				list[idx](emitEntries[jdx]);
			}
		}

		analytics = list;
		emitEntries.length = 0;
	}

	function emit(entry: Entry) {
		let idx = analytics.length;
		if (idx) {
			while (idx--) {
				analytics[idx](entry);
			}
		} else {
			emitEntries.unshift(entry);
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
		let unit: Entry['unit'];
		let duration: number;
		let selfDuration: number;
		let logMsg: string;
		let nextEntries: Entry[];
		let nextLength: number;

		for (; i < entries.length; i++) {
			entry = entries[i];
			unit = entry.unit;

			if (entry.end !== nil && !entry.active) {
				nextEntries = entry.entries;
				nextLength = nextEntries ? nextEntries.length : 0;

				start = entry.start;
				duration = (entry.end - start) / (unit === 'KiB' ? 1024 : 1);
				logMsg = `${prefix}${entry.name}: %c${duration.toFixed(3)}${unit}`;

				if (nextLength < 1) {
					console.log(
						logMsg,
						`${BOLD}${color(duration, unit)}`,
					);

					total += duration;
				} else {
					console[
						console[s_groupCollapsed] && ((entry as GroupEntry)._ || nextLength < 2)
							? s_groupCollapsed
							: s_group
					](
						logMsg,
						color(duration, unit),
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
							`${BOLD}${color(selfDuration, unit)}`,
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
			state && print();
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
			unit: 'ms',
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
			entry.unit = parent.unit;
			parent.active++;
			parent.entries.push(entry);
		}

		if (isGroup) {
			(entry as GroupEntry).add = add;
			(entry as GroupEntry).time = time;
			(entry as GroupEntry).timeEnd = timeEnd;
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
				emit(entry);
				closeGroup(entry.parent, end);
			}
		}
	}

	function add(this: GroupEntry, name: string, start: number, end: number) {
		if (start >= 0 && start <= end) {
			createEntry(name, this, false, start).stop(end);
		}
	}

	function time(this: GroupEntry, name: string, executer?: () => void) {
		const entry = createEntry(name, this, false);

		if (executer != null) {
			executer();
			entry.stop();
		} else {
			return entry;
		}
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
		let entry: Entry;
		while (idx--) {
			entry = entries[idx];
			(entry.entries === nil) && entry.stop();
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
		perf: perf as Performance,
		entries,
		print,
		disable,
		setAnalytics,
		add,
		time,
		timeEnd,
		group,
		groupEnd,
	});
};

export const system = globalThis.timekeeper ? globalThis.timekeeper.system : create({
	print: /^(file:|https?:\/\/(localhost|artifact-project))/.test(globalThis.location + ''),
	timeline: true,
	prefix: '⚡️',
});