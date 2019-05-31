import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, createTimingsGroup, performance } from '../utils';

export type MemoryStatsIntervals = Array<[string, number]>
export type MemoryStatsOptions = {
	intervals?: MemoryStatsIntervals;
}

const MIN = 60 * 1e3;

type MemoryStats = {
	jsHeapSizeLimit: 0,
	totalJSHeapSize: 0,
	usedJSHeapSize: 0,
}

export function memoryStats(keeper: PerfKeeper, options: MemoryStatsOptions = {}) {
	const [setStats, sendStats] = createTimingsGroup('pk-memory', keeper, 'KiB');
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
		let rootName = 'start';

		function send() {
			const memory = (performance as any).memory as MemoryStats;
			const next = intervals.shift();
			const total = memory.totalJSHeapSize;

			setStats('total', 0, total);
			setStats('used', 0, memory.usedJSHeapSize);
			setStats('js', 0, memory.jsHeapSizeLimit);
			sendStats(rootName, 0, total);

			if (next) {
				rootName = next[0];
				setTimeout(send, next[1]);
			}
		}

		try {
			send();
		} catch (_) {}
	});
}
