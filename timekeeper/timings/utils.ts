import { TimeKeeper } from '../src/timekeeper/timekeeper';

export const globalThis = Function('return this')() as Window;

export function domReady(fn: () => void) {
	if (globalThis.document.readyState === 'complete') {
		fn();
	} else {
		window.addEventListener('DOMContentLoaded', fn);
	}
}

export function sendTimingsFactory(name: string, keeper: TimeKeeper) {
	return function sendTimings(
		groupName: string | null,
		start: number,
		end: number,
		timings: Array<[string, number, number]>,
	) {
		const group = keeper.group(groupName ? `${name}-${groupName}` : name, start, true);

		timings.forEach((tuple) => {
			group.add(tuple[0], tuple[1], tuple[2]);
		});

		group.stop(end);
	}
}