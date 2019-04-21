import { PerfEntry } from '../../src/keeper/keeper';
import { AnalyticsOptions, globalThis, getOption, isBadTiming } from '../utils';

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
	const normalize = getOption(options, 'normalize')!;
	const sendZeroValues = getOption(options, 'sendZeroValues');
	const useTabName = getOption(options, 'useTabName');
	const queue = [] as MailRuAnalyticsParams[];
	const send = (params: MailRuAnalyticsParams) => {
		if (xray) {
			const {
				group,
				label,
				value,
			} = params;

			const metrica = [group];

			label && metrica.push(label)

			xray(`${prefix}${normalize(metrica).join('_')}&v=${value}${(project ? `&p=${project}` : '')}`);

			if (useTabName) {
				xray(
					`${prefix}${normalize(metrica.concat(useTabName(globalThis.location))).join('_')}&v=${value}`
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
		if (isBadTiming(entry)) {
			return;
		}

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

		const value = Math.round(entry.end! - entry.start!);

		(value || sendZeroValues) && send({
			group,
			label,
			value,
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
