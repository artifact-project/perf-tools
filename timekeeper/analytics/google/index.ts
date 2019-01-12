import { Entry } from '../../src/timekeeper/timekeeper';

const HIT_TYPE_TIMING = 'timing';

type GoogleAnalyticsParams = {
	hitType: typeof HIT_TYPE_TIMING,
	timingCategory: string,
	timingVar: string,
	timingValue: number,
}

type GoogleAnalytics = (
	method: 'send',
	params: GoogleAnalyticsParams,
) => void;

export function googleAnalytics(ga?: GoogleAnalytics) {
	const queue = [] as GoogleAnalyticsParams[];
	const send = (params: GoogleAnalyticsParams) => {
		if (ga) {
			ga('send', params);
		} else {
			queue.push(params);
		}
	};

	if (!ga) {
		(function check() {
			if (window['ga']) {
				ga = window['ga'];
				queue.forEach(send);
				queue.length = 0;
			} else {
				setTimeout(check, 500);
			}
		})();
	}

	return (entry: Entry) => {
		let timingCategory = entry.name;
		let timingVar = 'value';

		if (entry.parent) {
			timingVar = entry.name;

			while (true) {
				entry = entry.parent;

				if (entry.parent) {
					timingVar = `${entry.name}_${timingVar}`;
				} else {
					timingCategory = entry.name;
					break;
				}
			}
		}

		send({
			hitType: HIT_TYPE_TIMING,
			timingCategory,
			timingVar,
			timingValue: entry.end - entry.start,
		});
	};
}