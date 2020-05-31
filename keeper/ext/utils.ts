import { PerfKeeper, PerfEntry, PerfGroupEntry } from '../src/keeper/keeper';

export const nativeGlobalThis = (0
	|| typeof globalThis === 'object' && globalThis 
	|| typeof window === 'object' && window
	|| typeof global === 'object' && global
	|| {}
) as Window & {
	mozPaintCount?: number;
};

export const document = nativeGlobalThis.document;
export const performance = nativeGlobalThis.performance;
export const now = performance && performance.now
	? () => performance.now()
	: Date.now
;

export function domReady(fn: () => void) {
	if (document.readyState === 'complete') {
		fn();
	} else {
		nativeGlobalThis.addEventListener('DOMContentLoaded', fn);
	}
}

export type Timing = {
	name: string;
	start: number;
	end: number;
	unit: PerfEntry['unit'];
	nested: {
		[name:string]: Timing;
	};
}

export type TimingTuple = [
	(path: string | string[], start: number, end: number, unit?: PerfEntry['unit']) => void,
	(groupName: string | null, start: number, end: number, reset?: boolean) => void
]

const EMPTY_ARRAY = [] as string[];

export function createTimingsGroup(name: string, keeper: PerfKeeper, unit?: PerfEntry['unit'], sort?: boolean): TimingTuple {
	let rootTiming = {} as Timing;

	function set(path: string | string[], start: number, end: number, unit?: PerfEntry['unit']) {
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
			timing.unit = unit as PerfEntry['unit'];
		}
	}

	function send(groupName: string | null, start: number, end: number, reset?: boolean) {
		rootTiming.name = groupName ? `${name}-${groupName}` : name;
		rootTiming.start = start;
		rootTiming.end = end;

		(function walk(timing: Timing, group: PerfGroupEntry | null) {
			const nested = timing.nested;
			const nestedKeys = nested ? Object.keys(nested) : EMPTY_ARRAY;

			if (nestedKeys.length) {
				const nestedGroup = (group || keeper).group(timing.name, timing.start, true);

				nestedGroup._ = true;
				nestedGroup.unit = unit || 'ms';

				(sort === false ? nestedKeys : nestedKeys.sort()).forEach((key) => {
					walk(nested[key], nestedGroup);
				});

				nestedGroup.stop(timing.end);
			} else if (group) {
				group.add(timing.name, timing.start, timing.end);
				group.entries![group.entries!.length - 1].unit = timing.unit || group.unit;
			}
		})(rootTiming, null);

		reset && (rootTiming = {} as Timing)
	}

	return [set, send];
}
