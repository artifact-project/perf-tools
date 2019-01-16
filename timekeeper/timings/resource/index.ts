import { TimeKeeper } from '../../src/timekeeper/timekeeper';
import { domReady, sendTimingsFactory, sortObjectKeys, createTamingsGroup } from '../utils';

export type ResourceTimingsIntervals = Array<[string, number]>
export type ResourceTimingsOptions = {
	resourceName?: (entry: PerformanceResourceTiming) => string[];
	resourceCategoryName?: (entry: PerformanceResourceTiming) => string[];
	intervals?: ResourceTimingsIntervals;
}

const R_RESOURCE = /^https?:\/\/(?:www\.)?(.*?)\.[a-z]+\//;

const MIN = 60 * 1e3;

type ResourceStats = {
	[key:string]: number;
}

export function resourceTimings(keeper: TimeKeeper, options: ResourceTimingsOptions = {}) {
	const [setBytes, sendBytes] = createTamingsGroup('tk-resource-traffic', keeper, 'KiB');
	const [setCachedBytes, sendCachedBytes] = createTamingsGroup('tk-resource-traffic-cached', keeper, 'KiB');
	const [setStats, sendStats] = createTamingsGroup('tk-resource-stats', keeper);
	const resourceName = options.resourceName || ((entry: PerformanceResourceTiming) => {
		const parsed = R_RESOURCE.exec(entry.name);
		return parsed ? [entry.initiatorType, parsed[1]] : null;
	});
	const resourceCategoryName = options.resourceCategoryName;
	const intervals = options.intervals || [
		['15sec', 15e3],
		['1min', MIN],
		['5min', 5 * MIN],
		['15min', 15 * MIN],
		['30min', 30 * MIN],
		['1hour', 60 * MIN],
		['1day', 1 * 24 * 60 * MIN],
		['2days', 2 * 24 * 60 * MIN],
	];

	domReady(() => {
		const stats: ResourceStats = {
			size: 0,
			cached: 0,
			cachedSize: 0,
			transfered: 0,
			transferedSize: 0,
			unmeasurable: 0,
			duration: 0,
		} as {[key:string]: number};
		let entries = [] as PerformanceResourceTiming[];
		let rootName = 'start';

		function addSize(cached: boolean, key: string | string[], val: number) {
			key && (cached ? setCachedBytes : setBytes)(key, 0, val);
		}

		function check() {
			const newEntries = performance.getEntriesByType('resource') as PerformanceNavigationTiming[];

			(newEntries && newEntries.length > 0) && (entries = entries.concat(newEntries));
			performance.clearResourceTimings();
		}

		function send() {
			check();

			entries.forEach(entry => {
				let {
					duration,
					transferSize,
					entryType,
					nextHopProtocol:protocol,
					initiatorType,
				} = entry;
				const size = transferSize || entry.encodedBodySize || entry.decodedBodySize;
				const cached = !transferSize;

				if (initiatorType === 'navigation') {
					initiatorType = 'html';
				}

				if (initiatorType && size > 0) {
					addSize(cached, protocol, size);
					addSize(cached, entryType, size);
					addSize(cached, initiatorType, size);

					if (initiatorType !== 'html') {
						resourceName(entry).forEach((k, i, patch) => {
							if (i !== 0 || k !== protocol && k !== entryType && k !== initiatorType) {
								addSize(cached, patch.slice(0, i + 1), size);
							}
						});
					}
				}

				stats.size += size;
				stats.duration += duration;
				stats[initiatorType] = (stats[initiatorType] || 0) + 1;

				if (cached) {
					stats.cached++;
					stats.cachedSize += size;
				} else if (size > 0) {
					stats.transfered++;
					stats.transferedSize += size;
				} else {
					stats.unmeasurable++;
				}
			});

			// Stats
			Object.keys(stats).forEach((key) => {
				setStats(key, 0, stats[key]);
			});
			sendStats(rootName, 0, stats.size);

			// Transfered
			(stats.transfered > 0) && sendBytes(rootName, 0, stats.transferedSize);

			// Cached
			(stats.cachedSize > 0) && sendCachedBytes(rootName, 0, stats.cachedSize);

			entries.length = 0;

			const next = intervals.shift();
			if (next) {
				rootName = next[0];
				setTimeout(send, next[1]);
			}
		}

		try {
			send();

			performance.onresourcetimingbufferfull = () => {
				check();
			};
		} catch (_) {
		}
	});
}
