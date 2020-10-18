import type { EntryUnit, Addon, GroupEntry, Entry } from '../../core/core';
import { noop, console } from '../../util/global';

export type ConsoleAddon = {
	badge: string;
}

export const create = (options: ConsoleAddon): Addon => ({
	start: noop,
	end(entry) {
		if (!entry.parent && 'entries' in entry) {
			print.call(options, entry);
		}
	},
});

function color(v: number, unit: EntryUnit): string {
	v = (
		unit === 'KB'
		? v / 8
		: unit === 'fps'
		? 70 - v
		: v
	);

	return 'color:#' + (
		v < 5 ? 'ccc' :
		v < 10 ? '666' :
		v < 25 ? '333' :
		v < 50 ? 'f90' :
		v < 100 ? 'f60' :
		'f00'
	);
}

function print(this: ConsoleAddon, entry: GroupEntry | Entry) {
	const {badge} = this;
	const unit = entry.unit;
	const dur = (entry.end! - entry.start!) / (unit === 'KB' ? 1024 : 1);
	const format = badge + entry.name + (
		unit === 'none' || !unit
		? '%c'
		: `: %c${!unit || unit === 'raw' ? dur : dur.toFixed(3) + unit}`
	);
	const formatArgs = `font-weight:bold;${color(dur, unit)}`;
	
	if ('entries' in entry) {
		(console.groupCollapsed || console.group)(format, formatArgs);
		entry.entries.forEach(print, this);
		console.groupEnd();
	} else {
		console.log(format, formatArgs);
	}
}
