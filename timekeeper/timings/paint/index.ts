import { TimeKeeper } from '../../src/timekeeper/timekeeper';
import { domReady, sendTimingsFactory } from '../utils';

type PaintTuple = [string, number, number];

export function paintTimings(keeper: TimeKeeper) {
	const sendTimings = sendTimingsFactory('tk-paint', keeper);

	domReady(function check() {
		try {
			const entries = performance.getEntriesByType('paint');

			if (entries.length > 1) {
				let end = 0;
				const timings = entries
					.sort((a, b) => a.startTime - b.startTime)
					.map(entry => {
						const tuple = [entry.name, end, entry.startTime] as PaintTuple;
						end = entry.startTime;
						return tuple;
					})
				;

				sendTimings(null, 0, end, timings);
			} else {
				setTimeout(check, 250);
			}
		} catch (_) {}
	});
}
