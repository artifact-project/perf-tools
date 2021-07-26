import { isType, STRING_TYPE, BOOLEAN_TYPE } from '../util/isType';
import { hiddenProperty } from '../util/hiddenProperty';
import { perfNow } from '../util/global';

export type EntryUnit = 'ms' | 'KB' | 'fps' | 'raw' | 'none';

export interface Entry {
	id: number;
	name: string;
	parent: GroupEntry | null;
	start: number | null;
	end: number | null;
	unit: EntryUnit;
	meta?: EntryMeta;
	
	stop(meta?: EntryMeta): this;
	stop(time?: number, meta?: EntryMeta): this;
}

export type EntryMeta = Record<string, any>;

export interface GroupEntry extends Entry {
	entries: Array<GroupEntry | Entry>;
	// active: number;

	add(name: string, start: number, end: number, unit?: EntryUnit, meta?: EntryMeta): Entry;
	time(name: string, unit?: EntryUnit): Entry;
	time(name: string, start: number, unit?: EntryUnit): Entry;
	
	timeEnd(name: string, meta?: EntryMeta): void;
	timeEnd(name: string, end?: number, meta?: EntryMeta): void;

	group(name: string, unit?: EntryUnit): GroupEntry;
	group(name: string, isolate: boolean, unit?: EntryUnit): GroupEntry;
	group(name: string, start?: number, unit?: EntryUnit): GroupEntry;
	group(name: string, start: number, isolate: boolean, unit?: EntryUnit): GroupEntry;
	
	groupEnd(name: string, meta?: EntryMeta): void;
	groupEnd(name: string, end?: number, meta?: EntryMeta): void;
}

const nil = null;
const undef = undefined;
const DEFAULT_UNIT: EntryUnit = 'ms';

export type Options = {
	now?: () => number;
	warn?: (msg: string) => void
	prefix?: string;
	addons?: Addon[];
};

export type Addon = {
	start: (entry: GroupEntry | Entry, autoMeasurable: boolean) => void;
	end: (entry: GroupEntry | Entry, autoMeasurable: boolean) => void;
}

export function create(opts?: Options) {
	opts = opts || {};
		
	let idx: number;
	let cid = 0;
	let tmpEntry: Entry | GroupEntry | undefined | null;
	let api:GroupEntry & {
		v: string;
		addons: Addon[];
	};

	const now = opts.now || perfNow;
	const warn = opts.warn;
	const prefix = opts.prefix || '';
	const addons = opts.addons || [];
	const activeGroups = [] as GroupEntry[];

	const notify = (hook: keyof Addon, entry: Entry, autoMeasurable: boolean) => {
		idx = addons.length;
		while (idx--) {
			addons[idx][hook](entry, autoMeasurable);
		}
	};

	const createEntry = (
		name: string,
		parent: GroupEntry | Entry | null,
		timers: Record<string, Entry | GroupEntry | null | undefined>,
		unit?: EntryUnit,
		isGroup?: 1 | 0,
		start?: number | null,
		end?: number | null,
		isolate?: 0 | 1 | boolean,
		meta?: EntryMeta,
	): Entry | GroupEntry => {
		name = prefix + name;

		if (parent === api || isolate) {
			parent = !isolate && activeGroups[0] || nil;
		}

		if (timers[name]) {
			warn && warn(`Timer '${name}' exists`);
		}

		const autoMeasurable = start == nil;
		const entry = timers[name] = <Entry | GroupEntry>{
			id: ++cid,
			name,
			parent,
			unit: unit || DEFAULT_UNIT as Entry['unit'],
			start: autoMeasurable ? now() : start,
			end: end != nil ? end : nil,
			meta,
		};

		hiddenProperty(entry, {
			stop(time?: number, meta?: EntryMeta) {
				if (time != nil && !(time >= 0)) {
					meta = time as any;
					time = undef;
				}

				entry.meta = entry.meta || meta;
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

				return entry;
			},
		});

		if (parent) {
			if (parent.end !== nil && end == nil) {
				warn && warn(`Timer '${name}' stopped`);
			} else {
				entry.unit = parent.unit;
				// (parent as GroupEntry).active++;
				(parent as GroupEntry).entries.push(entry);
			}
		}

		function entryEnd(name: string, end?: number, meta?: EntryMeta) {
			name = prefix + name;
			tmpEntry = timers[name];

			if (tmpEntry) {
				tmpEntry.stop(end, meta);
			} else {
				warn && warn(`Timer '${name}' not exists`);
			}
		};

		if (isGroup) {
			// (entry as GroupEntry).active = 0;
			(entry as GroupEntry).entries = [];

			hiddenProperty(entry, {
				add(name: string, start: number, end: number, unit?: EntryUnit, meta?: EntryMeta) {
					return createEntry(
						name,
						entry,
						timers,
						unit,
						0,
						start,
						end,
					).stop(end, meta);
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
	};

	api = createEntry(0 as any, nil, {}, DEFAULT_UNIT, 1, 0, 0, 1) as typeof api;
	api.v = process.env.PKG_VERSION!;
	api.addons = addons;

	return api;
}
