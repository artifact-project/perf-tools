import { observe, disconnect, takeRecords } from '../../util/observe';
import { getVitalsScore } from '../../util/vitals';
import { send } from '../../util/system';
import { firstHidden, hidden } from '../../util/visibility';

// https://wicg.github.io/event-timing/#sec-performance-event-timing
type PerformanceEntryFirstInput = PerformanceEntry & {
	target?: Element;
	cancelable?: boolean;
	processingStart?: DOMHighResTimeStamp;
}

let ttb = 0;
let tti = 0;
let perf: PerformanceObserver | undefined;

const handler = (entry: PerformanceEntryFirstInput) => {
	const startTime = entry.startTime;
	const value = entry.processingStart! - startTime;

	if (startTime < firstHidden()) {
		// https://web.dev/lighthouse-total-blocking-time/
		// https://nitropack.io/blog/post/what-is-total-blocking-time-tbt
		// 0-200     Green (good)
		// 600-600   Orange (needs improvement)
		// Over 600  Red (poor)
		ttb && send('pk-tbt', 0, ttb, {
			value: [0, ttb],
			[`score_${getVitalsScore(ttb, 200, 600)}`]: [0, ttb],
		});

		// https://web.dev/interactive/
		// 0-3800     Green (good)
		// 3800-7300  Orange (needs improvement)
		// Over 7300  Red (poor)
		tti && send('pk-tti', 0, tti, {
			value: [0, tti],
			[`score_${getVitalsScore(tti, 3800, 7300)}`]: [0, ttb],
		});

		disconnect(perf);
		disconnect(fid);
	}
};
const fid = observe('first-input', handler);

hidden(() => {
	takeRecords(fid, handler);
}, true);

export const initPerf = (fcpTime: number) => {
	perf = observe('longtask', (entry) => {
		const startTime = entry.startTime;
		const duration = entry.duration;

		if (startTime > fcpTime && entry.name === 'self') {
			// The main thread is considered "blocked" any time there's a Long Task—a task
			// that runs on the main thread for more than 50 milliseconds (ms).
			const blocked = duration - 50;
			
			if (duration > 0) {
				ttb += blocked;
				tti = startTime + duration;
			}
		}
	});
};
