import { Entry } from '../../src/timekeeper/timekeeper';
import { BaseAnalyticsOptions, baseAnalyticsOptions, globalThis } from '../utils';

type MailRuAnalyticsParams = {
	group: string;
	label: string;
	value: number;
};

type MailRuAnalytics = (packet: string) => void;

type MaulRuContext = Window & {
	require: (module: string) => MailRuAnalytics;
	xray: MailRuAnalytics;
};

export function mailruAnalytics(xray?: MailRuAnalytics, options: BaseAnalyticsOptions = baseAnalyticsOptions) {
	const queue = [] as MailRuAnalyticsParams[];
	const send = (params: MailRuAnalyticsParams) => {
		if (xray) {
			let label = params.label;

			if (options.useTabName) {
				label = `${options.useTabName(globalThis.location)}-${label}`;
			}

			xray(`${params.group}&${params.label}=${params.value}`);
		} else {
			queue.push(params);
		}
	};

	if (!xray) {
		(function check() {
			xray = get();
			if (xray) {
				queue.forEach(send);
				queue.length = 0;
			} else {
				setTimeout(check, 500);
			}
		})();
	}

	return (entry: Entry) => {
		let group = entry.name;
		let label = 'value';

		if (entry.parent) {
			label = entry.name;

			while (true) {
				entry = entry.parent;

				if (entry.parent) {
					label = `${entry.name}_${name}`;
				} else {
					group = entry.name;
					break;
				}
			}
		}

		send({
			group,
			label,
			value: entry.end - entry.start,
		});
	};
}

function get(): MailRuAnalytics {
	const require = (globalThis as MaulRuContext).require;
	let xray = (globalThis as MaulRuContext).xray;

	try {
		xray = require('@mail/xray');
	} catch (_) {
		try {
			xray = require('mrg-xray');
		} catch (_) {}
	}

	return typeof xray === 'function' ? xray : null;
}