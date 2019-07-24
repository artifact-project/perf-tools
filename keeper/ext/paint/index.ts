import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, createTimingsGroup, performance } from '../utils';

export type PaintTimingsOptions = {
	filter: (duration: number, entry: PerformanceEntry) => boolean | string;
}

export const defaultPaintTimingsOptions: PaintTimingsOptions = {
	filter: (duration, entry) => duration > 60 * 1000 ? `${entry.name}_slow` : duration > 0,
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
						if (f) {
							duration = Math.max(duration, startTime);
							set(f === true ? name : f, 0, startTime);
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
