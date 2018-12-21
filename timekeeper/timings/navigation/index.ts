import { TimeKeeper } from '../../src/timekeeper/timekeeper';

export function navigationTimings(keeper: TimeKeeper) {
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

		keeper.group('tk-navigation-net', navigationStart);
		keeper.add('redirect', redirectStart, redirectEnd);
		keeper.add('app-cache', redirectEnd, domainLookupStart);
		keeper.add('dns', domainLookupStart, domainLookupEnd);
		keeper.add('tcp', domainLookupEnd, requestStart);
		keeper.add('request', requestStart, responseStart);
		keeper.add('response', requestStart, responseEnd);
		keeper.groupEnd('tk-navigation-net', responseEnd);
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

			keeper.group('tk-navigation-dom', responseEnd);
			keeper.add('interactive', responseEnd, domInteractive);
			keeper.add('content-loaded', domInteractive, domContentLoadedEventEnd);
			keeper.add('complete', domContentLoadedEventEnd, domComplete);
			keeper.groupEnd('tk-navigation-dom', domComplete);
		} catch (_) {}
	});
}