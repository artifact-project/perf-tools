import { create, EntryUnit } from '../core/core';
import { nextFrame, location } from './global';
import { create as consoleOutput } from '../addon/console';

export const system = create({
	addons: /pk-print/.test(location as any) ? [consoleOutput({badge: '🔅'})] : [],
});

export type NestedMetrics = Record<string, [number, number] | [number, number, EntryUnit]>;

export const send = (
	groupName: string,
	start: number,
	end: number,
	nested: NestedMetrics,
	unit?: EntryUnit,
	meta?: any,
) => {
	nextFrame(() => {
		const group = system.group(groupName, start, unit);
		
		for (const key in nested) {
			if (nested.hasOwnProperty(key)) {
				const item = nested[key];
				group.add(key, item[0], item[1], item[2]);
			}
		}

		group.stop(end, meta);
	});
}
