import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, createTamingsGroup, performance } from '../utils';

export type PaintTimingsOptions = {
}

export const defaultPaintTimingsOptions: PaintTimingsOptions = {
};

export function paintTimings(keeper: PerfKeeper, _: PaintTimingsOptions = defaultPaintTimingsOptions) {
	const [set, send] = createTamingsGroup('pk-paint', keeper);

	domReady(function check() {
		try {
			let entries = performance.getEntriesByType('paint');

			if (entries.length > 1) {
				let duration = 0;
				let startTime = 0;

				entries
					.sort((a, b) => a.startTime - b.startTime)
					.forEach(entry => {
						startTime = entry.startTime;
						duration = Math.max(duration, startTime);
						set(entry.name, 0, startTime);
					})
				;

				send(null, 0, duration, true);
			} else {
				setTimeout(check, 250);
			}
		} catch (_) {}
	});
}
