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
	const useTabName = getOption(options, 'useTabName');
	const sendZeroValues = getOption(options, 'sendZeroValues');
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
	const sendQueue = (queue) => {
		const metrics = {};

		queue.forEach(entry => {
			const { group, label } = entry;

			// Если нет label, то шлём отдельным запросом
			if (!label) {
				send(entry);

				return;
			}

			const metricName = `${prefix}${group}`;

			if (metrics[metricName]) {
				metrics[metricName].push(entry);
			} else {
				metrics[metricName] = [entry];
			}
		});

		Object.entries(metrics).forEach(([metricName, submetrics]) => {
			// ['foo:1', 'bar:2', 'baz:3']
			const tabSubmetrics = [];
			const submetricsPairs = submetrics.map(({ label, value }) => {
				if (useTabName) {
					tabSubmetrics.push(`${label}_${useTabName(globalThis.location)}:${value}`);
				}

				return `${label}:${value}`;
			}).concat(tabSubmetrics);

			xray(`${metricName}&i=${submetricsPairs.join(',')}${(project ? `&p=${project}` : '')}`);
		});
	};

	if (!xray) {
		(function check() {
			xray = get();
			if (xray) {
				sendQueue(queue);
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
