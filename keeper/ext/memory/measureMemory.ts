import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, createTimingsGroup, performance } from '../utils';
import { createInterval } from './memory.util';

export type MemoryStatsIntervals = Array<[string, number]>;
export type MeasureMemoryOptions = {
	groupName?: string;
	intervals?: Array<[string, number]>;
	resourceName?: (url: string) => string;
}

export const interfaceNotSupportedMsg = `interface not supproted`

const userAgentSpecificTypesToKey: {
	[K in UserAgentSpecificTypes]: string;
} = {
	Detached: 'detached',
	JS: 'js',
	Shared: 'shared',
	Window: 'window',
};

const { isArray } = Array;

export function measureMemory(keeper: PerfKeeper, options: MeasureMemoryOptions = {}) {
	const name = options.groupName || 'pk-memory';
	const [setStats, sendStats] = createTimingsGroup(name, keeper, 'KiB');
	const resourceName = options.resourceName || defaultResourceName;

	function supported(state: boolean, err?: any) {
		const group = keeper.group(`${name}-supported`, 0, true);

		group._ = true;
		group.unit = 'none';

		if (err) {
			const fg = group.group('error', 0);
			fg._ = true;
			fg.unit = 'none';
			fg.add('true', 0, 1);
			err.name && fg.add(err.name, 0, 1);
			fg.stop(1)
		}

		group.add(`${state}`, 0, 1);
		group.stop(1);
	}

	if (!performance.measureMemory) {
		supported(false);
		return
	}

	domReady(() => {
		createInterval('ready', options.intervals, (group) => performance.measureMemory!().then((info) => {
			if (!checkInformationInterface(info)) {
				throw interfaceNotSupported(`PerformanceMeasureMemoryInformation`, info);
			}

			const {
				bytes,
				breakdown,
			} = info;
			const types = createValuesMap(setStats);
			const resources = createValuesMap(setStats);

			for (let item of breakdown) {
				if (!checkBreakdownInterface(item)) {
					interfaceNotSupported(`PerformanceMeasureMemoryBreakdown`, item);
					break;
				}

				item.userAgentSpecificTypes.forEach((type) => {
					types.plus(userAgentSpecificTypesToKey[type], item.bytes);
				});

				item.attribution.forEach((url) => {
					resources.plus(resourceName(url) || 'unknown', item.bytes);
				});
			}

			types.groupAs('type');
			resources.groupAs('resource');

			setStats('bytes', 0, bytes, 'KiB');
			sendStats(group, 0, bytes);
		}))
			.then(() => {
				supported(true);
			})
			.catch((reason) => {
				supported(false, reason);
			})
	});
}

function defaultResourceName(url: string): string {
	return url
		.replace(/(^https?:\/*|\/*$)/ig, '')
		.replace(/[^a-z0-9-]/ig, '_')
	;
}

function createValuesMap(setStats: (name: string[], start: number, end: number) => void) {
	const values = {} as { [key: string]: number };

	return {
		plus(key: string, value: number) {
			(values[key] == null) && (values[key] = 0);
			values[key] += value;
		},

		groupAs(name: string) {
			Object.keys(values).forEach(key => {
				setStats([name, key], 0, values[key]);
			});
		},
	};
}

function checkInformationInterface(info?: PerformanceMeasureMemoryInformation) {
	return (1
		&& info
		&& (info.bytes >= 0)
		&& isArray(info.breakdown)
	);
}

function checkBreakdownInterface(breakdown?: PerformanceMeasureMemoryBreakdown) {
	return (1
		&& breakdown
		&& (breakdown.bytes >= 0)
		&& isArray(breakdown.attribution)
		&& isArray(breakdown.userAgentSpecificTypes)
	);
}

function interfaceNotSupported(name: string, val: any) {
	console.warn(`[@perf-tools/keeper] Interface '${name}' not supported, please report this.`, val);
}
