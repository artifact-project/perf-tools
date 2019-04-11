import { PerfEntry } from '../../src/keeper/keeper';
import { AnalyticsOptions, getOption, isBadTiming } from '../utils';

type YandexAnalyticsParams = {
	[name:string]: number | YandexAnalyticsParams;
}

type YandexAnalytics = (id: string, cmd: 'params', params: YandexAnalyticsParams) => void;

export function yandexAnalytics(options?: AnalyticsOptions & {id: string}, ym?: YandexAnalytics) {
	const id = getOption(options, 'id')!;
	const prefix = getOption(options, 'prefix');
	const useTabName = getOption(options, 'useTabName');
	const sendZeroValues = getOption(options, 'sendZeroValues');
	const queue = [] as YandexAnalyticsParams[];
	const send = (params: YandexAnalyticsParams) => {
		if (ym) {
			ym(id, 'params', params);
		} else {
			queue.push(params);
		}
	};

	!ym && (function check() {
		ym = window['ym'];
		if (ym) {
			queue.forEach(send);
			queue.length = 0;
		} else {
			setTimeout(check, 500);
		}
	})();

	return (entry: PerfEntry) => {
		if (isBadTiming(entry)) {
			return;
		}

		const path = [] as string[];
		const params = {} as YandexAnalyticsParams;
		let cursor = entry;

		do {
			path.unshift(cursor.name);
		} while (cursor = cursor.parent!);

		useTabName && path.push('__page__', useTabName(location));

		let obj = params;
		let i = 0;
		let l = path.length - 1;

		for (; i < l; i++) {
			obj = (obj[(i === 0 && prefix ? prefix : '')+ path[i]] = {});
		}

		obj[path[l]] = Math.round(entry.end! - entry.start!);

		(obj[path[l]] || sendZeroValues) && send(params);
	};
}