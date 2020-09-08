import { hidden, firstHidden } from '../../util/visibility';
import { firstInput } from '../../util/input';
import { observe, disconnect, takeRecords } from '../../util/observe';
import { send } from '../../util/system';
import { getVitalsScore } from '../../util/vitals';

let value = 0;
let resolved = false;
const handler = (entry: PerformanceEntry) => {
	const duration = entry.startTime;

	if (duration < firstHidden()) {
		value = duration;
	} else {
		finalization();
	}
};
const po = observe('largest-contentful-paint', handler);
const finalization = () => {
	// https://web.dev/lcp/
	// 0-2.5   Green (good)
	// 2.5-4   Orange (needs improvement)
	// Over 4  Red (poor)
	!resolved && value && send('pk-lcp', 0, value, {
		value: [0, value],
		[`score_${getVitalsScore(value, 2500, 4000)}`]: [0, value],
	});
	resolved = true;
	disconnect(po);
};

const resolve = () => {
	takeRecords(po, handler);
	finalization();
};

hidden(resolve, true);
firstInput(resolve);
