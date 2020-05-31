export type MemoryIntervals = Array<[string, number]>;
export type BaseMemoryOptions = {
	groupName?: string;
	intervals?: MemoryIntervals;
};

const MIN = 60 * 1e3;
const defaultIntervals: MemoryIntervals = [
	['15sec', 15e3],
	['1min', MIN],
	['5min', 5 * MIN],
	['15min', 15 * MIN],
	['30min', 30 * MIN],
	['1hour', 60 * MIN],
	['1day', 1 * 24 * 60 * MIN],
	['2days', 2 * 24 * 60 * MIN],
];

export function createInterval(
	group: string,
	intervals: MemoryIntervals | undefined,
	send: (groupName: string) => void,
) {
	const state: MemoryIntervals = (intervals || defaultIntervals).slice(0);
	const startTS = Date.now();

	function check() {
		return new Promise(resolve => {
			resolve(send(group));
		}).then(() => {
			const next = state.shift();
			if (next) {
				group = next[0];
				setTimeout(check, Math.max(0, next[1] - (Date.now() - startTS)));
			}
		});
	}

	return check();
}
