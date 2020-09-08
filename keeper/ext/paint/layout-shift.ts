import { observe, takeRecords } from '../../util/observe';
import { hidden } from '../../util/visibility';
import { send } from '../../util/system';
import { getVitalsScore } from '../../util/vitals';

// https://wicg.github.io/layout-instability/#sec-layout-shift
type PerformanceEntryLayoutShift = PerformanceEntry & {
	value?: number;
	hadRecentInput?: boolean;
}

let value = 0;
const handler = (entry: PerformanceEntryLayoutShift) => {
	if (!entry.hadRecentInput) {
		value += entry.value!;
	}
};
const po = observe('layout-shift', handler);

hidden((_, unloaded) => {
	takeRecords(po, handler);

	if (unloaded && value) {
		// https://web.dev/cls/
		// 0-0.1      Green (good)
		// 0.1-0.25   Orange (needs improvement)
		// Over 0.25  Red (poor)
		send('pk-cls', 0, value, {
			value: [0, value],
			[`score_${getVitalsScore(value, 0.1, 0.25)}`]: [0, value],
		});
	}
});
