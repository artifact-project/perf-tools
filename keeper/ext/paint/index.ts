import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, createTimingsGroup, performance } from '../utils';

export type PaintTimingsOptions = {
	filter: (duration: number, entry: PerformanceEntry) => false | string;
}

export const defaultPaintTimingsOptions: PaintTimingsOptions = {
	filter: (duration) => (
		duration < 2e3 ? `%-fast` :
		duration < 4e3 ? `%-moderate` :
		duration > 6e4 ? `%-very-slow` : `%-slow`
	),
};

export function paintTimings(
	keeper: PerfKeeper,
	options?: PaintTimingsOptions,
) {
	const {
		filter = defaultPaintTimingsOptions.filter,
	} = options || defaultPaintTimingsOptions;
	const [set, send] = createTimingsGroup('pk-paint', keeper);

	domReady(function check() {
		try {
			let entries = performance.getEntriesByType('paint');

			if (entries.length > 1) {
				let duration = 0;
				let startTime = 0;
				let name: string;
				let f: boolean | string;

				entries
					.sort((a, b) => a.startTime - b.startTime)
					.forEach(entry => {
						startTime = entry.startTime;
						name = entry.name;
						f = filter(startTime, entry);
						
						if (startTime > 0) {
							duration = Math.max(duration, startTime);
							set(name, 0, startTime);
							f && set(f.replace('%', name), 0, startTime);
						}
					})
				;

				duration && send(null, 0, duration, true);
			} else {
				setTimeout(check, 250);
			}
		} catch (_) {}
	});
}
