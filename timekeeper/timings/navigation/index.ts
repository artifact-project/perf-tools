import { TimeKeeper } from '../../src/timekeeper/timekeeper';

export function navigationTimings(kepper: TimeKeeper) {
	try {
		const {
			navigationStart,
			redirectStart,
			redirectEnd,
			domainLookupStart,
			domainLookupEnd,
			requestStart,
			responseStart,
			responseEnd,
		} = performance.timing;

		kepper.group('tk-navigation-net', navigationStart);
		kepper.add('redirect', redirectStart, redirectEnd);
		kepper.add('app-cache', redirectEnd, domainLookupStart);
		kepper.add('dns', domainLookupStart, domainLookupEnd);
		kepper.add('tcp', domainLookupEnd, requestStart);
		kepper.add('request', requestStart, responseStart);
		kepper.add('response', requestStart, responseEnd);
		kepper.groupEnd('tk-navigation-net', responseEnd);
	} catch (_) {}

	window.addEventListener('DOMContentLoaded', function check() {
		try {
			const {
				responseEnd,
				domInteractive,
				domContentLoadedEventEnd,
				domComplete,
			} = performance.timing;

			if (!domComplete) {
				setTimeout(check, 250);
				return;
			}

			kepper.group('tk-navigation-dom', responseEnd);
			kepper.add('interactive', responseEnd, domInteractive);
			kepper.add('content-loaded', domInteractive, domContentLoadedEventEnd);
			kepper.add('complete', domContentLoadedEventEnd, domComplete);
			kepper.groupEnd('tk-navigation-dom', domComplete);
		} catch (_) {}
	});
}