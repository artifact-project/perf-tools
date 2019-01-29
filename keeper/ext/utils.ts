import { PerfKeeper, Entry, GroupEntry } from '../src/keeper/keeper';

export const globalThis = Function('return this')() as Window & {
	mozPaintCount: number;
};

export const document = globalThis.document;
export const performance = globalThis.performance;
export const now = performance && performance.now
	? () => performance.now()
	: Date.now
;

export function domReady(fn: () => void) {
	if (document.readyState === 'complete') {
		fn();
	} else {
		globalThis.addEventListener('DOMContentLoaded', fn);
	}
}

export type Timing = {
	name: string;
	start: number;
	end: number;
	unit: Entry['unit'];
	nested: {
		[name:string]: Timing;
	};
}

export type TimingTuple = [
	(path: string | string[], start: number, end: number, unit?: Entry['unit']) => void,
	(groupName: string, start: number, end: number, reset?: boolean) => void
]

const EMPTY_ARRAY = [];

export function createTamingsGroup(name: string, keeper: PerfKeeper, unit?: Entry['unit'], sort?: boolean): TimingTuple {
	let rootTiming = {} as Timing;

	function set(path: string | string[], start: number, end: number, unit?: Entry['unit']) {
		let timing: Timing = rootTiming;

		EMPTY_ARRAY.concat(path).forEach(name => {
			const nested = timing.nested || (timing.nested = {});
			timing = nested[name] || (nested[name] = {name} as Timing);
		});

		if (timing.end != null) {
			timing.end += (end - start);
		} else {
			timing.start = start;
			timing.end = end;
			timing.unit = unit;
		}
	}

	function send(groupName: string, start: number, end: number, reset?: boolean) {
		rootTiming.name = groupName ? `${name}-${groupName}` : name;
		rootTiming.start = start;
		rootTiming.end = end;

		(function walk(timing: Timing, group: GroupEntry) {
			const nested = timing.nested;
			const nestedKeys = nested ? Object.keys(nested) : EMPTY_ARRAY;

			if (nestedKeys.length) {
				const nestedGroup = (group || keeper).group(timing.name, timing.start);

				nestedGroup._ = true;
				nestedGroup.unit = unit || 'ms';

				(sort === false ? nestedKeys : nestedKeys.sort()).forEach((key) => {
					walk(nested[key], nestedGroup);
				});

				nestedGroup.stop(timing.end);
			} else {
				group.add(timing.name, timing.start, timing.end);
				group.entries[group.entries.length - 1].unit = timing.unit || group.unit;
			}
		})(rootTiming, null);

		reset && (rootTiming = {} as Timing)
	}

	return [set, send];
}