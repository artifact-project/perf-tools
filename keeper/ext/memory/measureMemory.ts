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

const MIN = 60 * 1e3;
const { isArray } = Array;

export function measureMemory(keeper: PerfKeeper, options: MeasureMemoryOptions = {}) {
	const [setStats, sendStats] = createTimingsGroup(options.groupName || 'pk-memory', keeper, 'KiB');
	const resourceName = options.resourceName || defaultResourceName;

	function supported(state: boolean, err?: any) {
		err && setStats('failed', 0, 1, 'none');
		(err && err.name) && setStats(`error_${err.name}`, 0, 1, 'none');
		setStats('' + state, 0, 1, 'none');
		sendStats('supported', 0, 1)
	}

	if (!performance.measureMemory) {
		supported(false);
		return
	}

	domReady(() => {
		createInterval('ready', options.intervals, (group) => performance.measureMemory!().then((info) => {
			if (!info || !checkInformationInterface(info)) {
				throw interfaceNotSupported(`PerformanceMeasureMemoryInformation`);
			}

			const {
				bytes,
				breakdown,
			} = info;
			const types = createValuesMap(setStats);
			const resources = createValuesMap(setStats);

			for (let item of breakdown) {
				if (checkBreakdownInterface(item)) {
					interfaceNotSupported(`PerformanceMeasureMemoryBreakdown`);
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
			.then(() => { supported(true); })
			.catch((reason) => { supported(false, reason); })
	});
}

function defaultResourceName(url: string): string {
	return url
		.replace(/(^https?:\/*|\/*$)/, '')
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

function checkInformationInterface(info: PerformanceMeasureMemoryInformation) {
	return (1
		&& (info.bytes >= 0)
		&& isArray(info.breakdown)
	);
}

function checkBreakdownInterface(breakdown: PerformanceMeasureMemoryBreakdown) {
	return (1
		&& (breakdown.bytes > 0)
		&& isArray(breakdown.attribution)
		&& isArray(breakdown.userAgentSpecificTypes)
	);
}

function interfaceNotSupported(name: string) {
	console.warn(`Interface '${name}' not supported, please report this.`);
}
