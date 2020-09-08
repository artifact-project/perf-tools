import { create, EntryUnit } from '../core/core';

export const system = create();

export type NestedMetrics = Record<string, [number, number] | [number, number, EntryUnit]>;

export const send = (
	groupName: string,
	start: number,
	end: number,
	nested: NestedMetrics,
	unit?: EntryUnit,
) => {
	requestAnimationFrame(() => {
		const group = system.group(groupName, start, unit);
		
		for (const key in nested) {
			if (nested.hasOwnProperty(key)) {
				const item = nested[key];
				group.add(key, item[0], item[1], item[2]);
			}
		}

		group.stop(end);
	});
}
