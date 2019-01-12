import { Entry } from '../../src/timekeeper/timekeeper';

type MailRuAnalyticsParams = {
	category: string;
	label: string;
	value: number;
};

type MailRuAnalytics = (packet: string) => void;

export function mailruAnalytics(xray?: MailRuAnalytics) {
	const queue = [] as MailRuAnalyticsParams[];
	const send = (params: MailRuAnalyticsParams) => {
		if (xray) {
			xray(`${params.category}&${params.label}=${params.value}`);
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
		let category = entry.name;
		let label = 'value';

		if (entry.parent) {
			label = entry.name;

			while (true) {
				entry = entry.parent;

				if (entry.parent) {
					label = `${entry.name}_${name}`;
				} else {
					category = entry.name;
					break;
				}
			}
		}

		send({
			category,
			label,
			value: entry.end - entry.start,
		});
	};
}

const globalThis = Function('return this')() as Window & {
	require?: (module: string) => MailRuAnalytics;
	xray?: MailRuAnalytics;
};

function get(): MailRuAnalytics {
	const require = globalThis.require;
	let xray = globalThis.xray;

	try {
		xray = require('@mail/xray');
	} catch (_) {
		try {
			xray = require('mrg-xray');
		} catch (_) {}
	}

	return typeof xray === 'function' ? xray : null;
}