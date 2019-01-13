import { TimeKeeper } from '../../src/timekeeper/timekeeper';

export function navigationTimings(keeper: TimeKeeper) {
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

		const gnet = keeper.group('tk-navigation-net', navigationStart, true);
		gnet.add('redirect', redirectStart, redirectEnd);
		gnet.add('app-cache', fetchStart, domainLookupStart);
		gnet.add('dns', domainLookupStart, domainLookupEnd);
		gnet.add('tcp', domainLookupEnd, requestStart);
		gnet.add('request', requestStart, responseStart);
		gnet.add('response', responseStart, responseEnd);
		gnet.stop(responseEnd);
	} catch (_) {}

	ready(function checkDomComplete() {
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

			const gdom = keeper.group('tk-navigation-dom-ready', responseEnd, true);
			gdom.add('interactive', responseEnd, domInteractive);
			gdom.add('content-loaded', domInteractive, domContentLoadedEventEnd);
			gdom.add('complete', domContentLoadedEventEnd, domComplete);
			gdom.stop(domComplete);
		} catch (_) {}
	});

	ready(function checkLoadEventEnd() {
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

			const gdom = keeper.group('tk-navigation-dom-load', responseEnd, true);
			gdom.add('ready', responseEnd, domComplete);
			gdom.add('load', domComplete, loadEventEnd);
			gdom.stop(loadEventEnd);
		} catch (_) {}
	});
}

function ready(fn: () => void) {
	if (document.readyState === 'complete') {
		fn();
	} else {
		window.addEventListener('DOMContentLoaded', fn);
	}
}