import { TimeKeeper } from '../../src/timekeeper/timekeeper';
import { sendTimingsFactory, domReady } from '../utils';

export function navigationTimings(keeper: TimeKeeper) {
	const sendTimings = sendTimingsFactory('tk-navigation', keeper);

	try {
		const {
			navigationStart,
			redirectStart,
			redirectEnd,
			fetchStart,
			domainLookupStart,
			domainLookupEnd,
			requestStart,
			responseStart,
			responseEnd,
		} = performance.timing;

		sendTimings('net', navigationStart, responseEnd, [
			['redirect', redirectStart, redirectEnd],
			['app-cache', fetchStart, domainLookupStart],
			['dns', domainLookupStart, domainLookupEnd],
			['tcp', domainLookupEnd, requestStart],
			['request', requestStart, responseStart],
			['response', responseStart, responseEnd],
		]);
	} catch (_) {}

	domReady(function checkDomComplete() {
		try {
			const {
				responseEnd,
				domInteractive,
				domContentLoadedEventEnd,
				domComplete,
			} = performance.timing;

			if (!domComplete) {
				setTimeout(checkDomComplete, 250);
				return;
			}

			sendTimings('dom-ready', responseEnd, domComplete, [
				['interactive', responseEnd, domInteractive],
				['content-loaded', domInteractive, domContentLoadedEventEnd],
				['complete', domContentLoadedEventEnd, domComplete],
			]);
		} catch (_) {}
	});

	domReady(function checkLoadEventEnd() {
		try {
			const {
				responseEnd,
				domComplete,
				loadEventEnd,
			} = performance.timing;

			if (!loadEventEnd) {
				setTimeout(checkLoadEventEnd, 250);
				return;
			}

			sendTimings('dom-load', responseEnd, loadEventEnd, [
				['ready', responseEnd, domComplete],
				['load', domComplete, loadEventEnd],
			]);
		} catch (_) {}
	});
}