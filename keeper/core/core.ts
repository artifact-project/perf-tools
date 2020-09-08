import { isType, STRING_TYPE, BOOLEAN_TYPE } from '../util/isType';
import { hidden } from '../util/hidden';

export type Keeper = {
	// add(name: string, start: number, end: number, unit?: EntryUnit): void;
	
	// group(name: string, unit?: EntryUnit): GroupEntry;
	// group(name: string, isolate: boolean, unit?: EntryUnit): GroupEntry;
	// group(name: string, start?: number, unit?: EntryUnit): GroupEntry;
	// group(name: string, start: number, isolate: boolean, unit?: EntryUnit): GroupEntry;
	// groupEnd(name: string, end?: number): void;
}

export type EntryUnit = 'ms' | 'KB' | 'fps' | 'raw' | 'none';

export type Entry = {
	id: number;
	name: string;
	parent: GroupEntry | null;
	start: number | null;
	end: number | null;
	unit: EntryUnit;
	stop: (time?: number) => void;
}

export type GroupEntry = Entry & {
	entries: Array<GroupEntry | Entry>;
	// active: number;

	add(name: string, start: number, end: number, unit?: EntryUnit): Entry;
	time(name: string, unit?: EntryUnit): Entry;
	time(name: string, start: number, unit?: EntryUnit): Entry;
	timeEnd(name: string): void;

	group(name: string, unit?: EntryUnit): GroupEntry;
	group(name: string, isolate: boolean, unit?: EntryUnit): GroupEntry;
	group(name: string, start?: number, unit?: EntryUnit): GroupEntry;
	group(name: string, start: number, isolate: boolean, unit?: EntryUnit): GroupEntry;
	groupEnd(name: string, end?: number): void;
}

const nil = null;
const DEFAULT_UNIT: EntryUnit = 'ms';

export type Options = {
	now?: () => number;
	warn?: (msg: string) => void
	addons?: Addon[];
};

export type Addon = {
	start: (entry: GroupEntry | Entry, autoMeasurable: boolean) => void;
	end: (entry: GroupEntry | Entry, autoMeasurable: boolean) => void;
}

export function create(opts?: Options) {
	opts = opts || {};

	const activeGroups = [] as GroupEntry[];

	const now = opts.now || (() => performance.now());
	const warn = opts.warn;
	const addons = opts.addons || [];

	let idx: number;
	let cid = 0;
	let tmpEntry: Entry | GroupEntry | undefined | null;

	const api = createEntry(nil as any, nil, {}, DEFAULT_UNIT, 1) as GroupEntry & {addons: Addon[]};
	api.addons = addons;

	function notify(hook: keyof Addon, entry: Entry, autoMeasurable: boolean) {
		idx = addons.length;
		while (idx--) {
			addons[idx][hook](entry, autoMeasurable);
		}
	}

	function createEntry(
		name: string,
		parent: GroupEntry | Entry | null,
		timers: Record<string, Entry | GroupEntry | null | undefined>,
		unit?: EntryUnit,
		isGroup?: 1 | 0,
		start?: number | null,
		end?: number | null,
		isolate?: boolean,
	): Entry | GroupEntry {
		if (parent === api || isolate) {
			parent = !isolate && activeGroups[0] || nil;
		}

		const autoMeasurable = start == nil;
		const entry = timers[name] = <Entry | GroupEntry>{
			id: ++cid,
			name,
			parent,
			unit: unit || DEFAULT_UNIT as Entry['unit'],
			start: autoMeasurable ? now() : start,
			end: end != nil ? end : nil,
		};
		const msgPrefix = `Timer '${name}' `;

		if (timers[name]) {
			warn && warn(`${msgPrefix}exists`);
		}
		
		hidden(entry, {
			stop(time?: number) {
				entry.end = time == nil ? now() : time;
				timers[name] = nil;
				
				if (isGroup) {
					idx = activeGroups.length;
					while (idx--) {
						if (activeGroups[idx] === entry) {
							activeGroups.splice(idx, 1);
						}
					}
				}

				notify('end', entry, autoMeasurable);
			},
		});

		if (parent) {
			if (parent.end !== nil && end == nil) {
				warn && warn(`${msgPrefix}stopped`);
			} else {
				entry.unit = parent.unit;
				// (parent as GroupEntry).active++;
				(parent as GroupEntry).entries.push(entry);
			}
		}

		function entryEnd(name: string) {
			tmpEntry = timers[name];
			if (tmpEntry) {
				tmpEntry.stop();
			} else {
				warn && warn(`${msgPrefix}not exists`);
			}
		}

		if (isGroup) {
			// (entry as GroupEntry).active = 0;
			(entry as GroupEntry).entries = [];

			hidden(entry, {
				add(name: string, start: number, end: number, unit?: EntryUnit) {
					createEntry(
						name,
						entry,
						timers,
						unit,
						0,
						start,
						end,
					).stop(end);
				},

				time(name: string, unit?: EntryUnit): Entry {
					return createEntry(
						name,
						entry,
						timers,
						unit,
					);
				},

				group(
					name: string,
					startOrIsolateOrUnit?: number | boolean | EntryUnit | null,
					isolateOrUnit?: boolean | EntryUnit,
					unit?: EntryUnit,
				): GroupEntry {
					if (isType(startOrIsolateOrUnit, BOOLEAN_TYPE)) {
						unit = isolateOrUnit as EntryUnit;
						isolateOrUnit = startOrIsolateOrUnit;
						startOrIsolateOrUnit = nil
					}

					if (isType(startOrIsolateOrUnit, STRING_TYPE)) {
						unit = startOrIsolateOrUnit as EntryUnit;
						startOrIsolateOrUnit = nil;
						isolateOrUnit = 0 as any
					}
					
					if (isType(isolateOrUnit, STRING_TYPE)) {
						unit = isolateOrUnit;
					}

					return createEntry(
						name,
						entry,
						timers,
						unit,
						1,
						startOrIsolateOrUnit as number,
						nil,
						isolateOrUnit as boolean,
					) as GroupEntry;
				},

				timeEnd: entryEnd,
				groupEnd: entryEnd,
			});

			!isolate && (cid > 1) && activeGroups.unshift(entry as GroupEntry);
		}

		notify('start', entry, autoMeasurable);

		return entry;
	}


	return api;
}
