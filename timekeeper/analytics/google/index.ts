import { Entry } from '../../src/timekeeper/timekeeper';
import { BaseAnalyticsOptions, baseAnalyticsOptions, globalThis } from '../utils';

const HIT_TYPE_TIMING = 'timing';

type GoogleAnalyticsParams = {
	hitType: typeof HIT_TYPE_TIMING;
	timingCategory: string;
	timingVar: string;
	timingValue: number;
	timingLabel?: string;
}

type GoogleAnalytics = (
	method: 'send',
	params: GoogleAnalyticsParams,
) => void;

export function googleAnalytics(ga?: GoogleAnalytics, options: BaseAnalyticsOptions = baseAnalyticsOptions) {
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
			ga = get();
			if (ga) {
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
		let cursor = entry.parent;

		if (cursor) {
			timingVar = entry.name;

			while (true) {
				if (cursor.parent) {
					timingVar = `${cursor.name}_${timingVar}`;
					cursor = cursor.parent;
				} else {
					timingCategory = cursor.name;
					break;
				}
			}
		}

		send({
			hitType: HIT_TYPE_TIMING,
			timingCategory,
			timingVar,
			timingValue: Math.round(entry.end - entry.start),
			timingLabel: options.useTabName ? options.useTabName(globalThis.location) : void 0,
		});
	};
}

function get() {
	if (globalThis['gtag']) {
		return (_: string, params: GoogleAnalyticsParams) => {
			globalThis['gtag'](
				'event',
				'timing_complete',
				{
					name: params.timingVar,
					value: params.timingValue,
					event_category: params.timingCategory,
					event_label: params.timingLabel,
				},
			);
		}
	}

	return globalThis['ga'];
}