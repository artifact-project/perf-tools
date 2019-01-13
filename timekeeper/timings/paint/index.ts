import { TimeKeeper } from '../../src/timekeeper/timekeeper';

type PaintTuple = [string, number, number];

export function paintTimings(keeper: TimeKeeper) {
	ready(function check() {
		try {
			const entries = performance.getEntriesByType('paint');

			if (entries.length > 1) {
				let end = 0;
				const values= entries
					.sort((a, b) => a.startTime - b.startTime)
					.map(entry => {
						const tuple = [entry.name, end, entry.startTime] as PaintTuple;
						end = entry.startTime;
						return tuple;
					})
				;

				keeper.group('tk-paint', 0);
				values.forEach(v => {
					keeper.add(v[0], v[1], v[2]);
				});
				keeper.groupEnd('tk-paint', end);
			} else {
				setTimeout(check, 250);
			}
		} catch (_) {}
	});
}

function ready(fn: () => void) {
	if (document.readyState === 'complete') {
		fn();
	} else {
		window.addEventListener('DOMContentLoaded', fn);
	}
}