import { observe, disconnect } from '../../util/observe';
import { hidden, firstHidden } from '../../util/visibility';
import { NestedMetrics, send } from '../../util/system';
import { getVitalsScore } from '../../util/vitals';
import { initPerf } from '../performance';

// First Paint
const nested = {} as NestedMetrics;
const po = observe('paint', (entry) => {
	const name = entry.name;
	const time = entry.startTime;

	if (time < firstHidden()) {
		nested[name] = [0, time];

		if (name === 'first-contentful-paint') {
			// https://web.dev/first-contentful-paint/
			// FCP time (in seconds) | Color-coding      | FCP score (HTTP Archive percentile)
			// 0–2	                 | Green (fast)      | 75–100
			// 2–4                   | Orange (moderate) | 50–74
			// Over 4                | Red (slow)        | 0–49
			nested[`score_${getVitalsScore(time, 1000, 2500)}`] = [0, time];

			send('pk-paint', 0, time, nested);
			initPerf(time);
			disconnect(po);
		}
	}
});
