
import { Metric, onCLS, onFCP, onLCP, onFID, onINP, onTTFB } from 'web-vitals';
import { send } from '../../util/system';

export const useWebVitals = () => {
	const use = <TMetric extends Metric>(name: string, onMetric: (fn: (data: TMetric) => void) => void) => {
		onMetric(({value, rating}) => {
			send(`pk-${name}`, 0, value, {
				value: [0, value],
				[`score_${rating}`]: [0, value],
			});
		});
	};

	use('paint', onFCP);
	use('cls', onCLS);
	use('lcp', onLCP);
	use('fid', onFID);
	use('inp', onINP);
	use('ttfb', onTTFB);
};
