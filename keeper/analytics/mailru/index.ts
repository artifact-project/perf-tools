import { PerfEntry } from '../../src/keeper/keeper';
import { AnalyticsOptions, globalThis, getOption } from '../utils';

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

export function mailruAnalytics(options?: AnalyticsOptions & {project?: string}, xray?: MailRuAnalytics | null) {
	const prefix = getOption(options, 'prefix');
	const project = getOption(options, 'project');
	const useTabName = getOption(options, 'useTabName');
	const queue = [] as MailRuAnalyticsParams[];
	const send = (params: MailRuAnalyticsParams) => {
		if (xray) {
			const {
				group,
				label,
				value,
			} = params;
			const labelParam = label ? `_${label}` : '';

			xray(`${prefix}${group}${labelParam}&v=${value}${(project ? `&p=${project}` : '')}`);

			if (useTabName) {
				xray(
					`${prefix}${group}${labelParam}_${useTabName(globalThis.location)}&v=${value}`
					+ (project ? `&p=${project}` : '')
				);
			}
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

	return (entry: PerfEntry) => {
		let group = entry.name;
		let label = 'value';
		let cursor = entry.parent;

		if (cursor) {
			label = entry.name;

			while (true) {
				if (cursor.parent) {
					label = `${cursor.name}_${label}`;
					cursor = cursor.parent;
				} else {
					group = cursor.name;
					break;
				}
			}
		}

		send({
			group,
			label,
			value: entry.end && entry.start ? Math.round(entry.end - entry.start) : 0,
		});
	};
}

function get(): MailRuAnalytics | null {
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
