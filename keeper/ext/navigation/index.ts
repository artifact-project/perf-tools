import { performance, setTimeout } from '../../util/global';
import { send } from '../../util/system';

let state = 0;
const check = () => {
	try {
		const {
			fetchStart,
			domainLookupStart,
			domainLookupEnd,
			requestStart,
			responseStart,
			responseEnd,
			domComplete,
			domInteractive,
			domContentLoadedEventEnd,
			loadEventEnd,
		} = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

		if (responseEnd && state === 0) {
			state = 1;

			send('pk-nav-net', fetchStart, responseEnd, {
				'dns': [domainLookupStart, domainLookupEnd],
				'tcp': [domainLookupEnd, requestStart],
				'request': [requestStart, responseStart],
				'response': [responseStart, responseEnd],
			});
		}

		if (domComplete && state === 1) {
			state = 2;
			
			send('pk-nav-dom-ready', responseEnd, domComplete, {
				'interactive': [responseEnd, domInteractive],
				'content-loaded': [domInteractive, domContentLoadedEventEnd],
				'complete': [domContentLoadedEventEnd, domComplete],
			});
		}

		if (loadEventEnd && state === 2) {
			state = 3;
			
			send('pk-nav-dom-load', responseEnd, loadEventEnd, {
				'ready': [responseEnd, domComplete],
				'load': [domComplete, loadEventEnd],
			});
		}

		if (state !== 3) {
			setTimeout(check, 250);
		}
	} catch {}
};

check();
