import { TimeKeeper, Entry, GroupEntry } from '../src/timekeeper/timekeeper';

export const globalThis = Function('return this')() as Window;

export function domReady(fn: () => void) {
	if (globalThis.document.readyState === 'complete') {
		fn();
	} else {
		globalThis.addEventListener('DOMContentLoaded', fn);
	}
}

export type Timing = {
	name: string;
	start: number;
	end: number;
	nested: {
		[name:string]: Timing;
	};
}

export type TimingsGroup = {
	timings: Timing['nested'];
	set: (path: string | string[], start: number, end: number) => void;
}

const EMPTY_ARRAY = [];

export function createTamingsGroup(name: string, keeper: TimeKeeper, unit?: Entry['unit']) {
	let rootTiming = {} as Timing;

	function set(path: string | string[], start: number, end: number) {
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
		}
	}

	function send(groupName: string, start: number, end: number) {
		rootTiming.name = groupName ? `${name}-${groupName}` : groupName;
		rootTiming.start = start;
		rootTiming.end = end;

		(function walk(timing: Timing, group: GroupEntry) {
			const nested = timing.nested;
			const nestedKeys = nested ? Object.keys(nested) : EMPTY_ARRAY;

			if (nestedKeys.length) {
				const nestedGroup = (group || keeper).group(timing.name, timing.start);

				nestedGroup._ = true;
				nestedGroup.unit = unit || 'ms';
				nestedKeys.sort().forEach((key) => {
					walk(nested[key], nestedGroup);
				});

				nestedGroup.stop(timing.end);
			} else {
				group.add(timing.name, timing.start, timing.end);
			}
		})(rootTiming, null);
	}

	return [set, send];
}

export function sendTimingsFactory(name: string, keeper: TimeKeeper, unit?: Entry['unit']) {
	return function sendTimings(
		groupName: string | null,
		start: number,
		end: number,
		timings: Array<[string, number, number]>,
	) {
		const group = keeper.group(groupName ? `${name}-${groupName}` : name, start, true);

		group._ = true;
		group.unit = unit || 'ms';
		timings.forEach((tuple) => {
			group.add(tuple[0], tuple[1], tuple[2]);
		});

		group.stop(end);
	}
}

export function sortObjectKeys<T extends object>(obj: T): T {
	return Object.keys(obj).sort().reduce((res, key) => {
		res[key] = obj[key];
		return res;
	}, {} as T);
}