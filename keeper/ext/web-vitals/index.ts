
import { Metric, onCLS, onFCP, onLCP, onFID, onINP, onTTFB } from 'web-vitals';
import { send } from '../../util/system';
import { initPerf } from '../performance';

export const useWebVitals = () => {
	const sendMetric = (name: string, {value, rating}: Metric) => {
		send(`pk-${name}`, 0, value, {
			value: [0, value],
			[`score_${rating}`]: [0, value],
		});
	};
	const use = <TMetric extends Metric>(name: string, onMetric: (fn: (data: TMetric) => void) => void) => {
		onMetric((data) => {
			sendMetric(name, data);
		});
	};

	//
	// Подписываемся на сбор метрик
	//
	onFCP((data) => {
		initPerf(data.value);
		sendMetric('paint', data);
	});

	use('cls', onCLS);
	use('lcp', onLCP);
	use('fid', onFID);
	use('inp', onINP);
	use('ttfb', onTTFB);

};
