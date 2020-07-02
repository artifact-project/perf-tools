import { PerfEntry } from '../src/keeper/keeper';

const nativeGlobalThis = (0
	|| typeof globalThis === 'object' && globalThis
	|| typeof window === 'object' && window
	|| typeof global === 'object' && global
	|| {}
) as (typeof globalThis);

export {
	nativeGlobalThis as globalThis,
}

export type AnalyticsOptions = {
	prefix?: string;
	normalize: (names: string[]) => string[];
	sendZeroValues?: boolean;
	useTabName?: (location: Location) => string;
}

const baseAnalyticsOptions: AnalyticsOptions = {
	prefix: '',
	normalize: names => names,
	sendZeroValues: false,
	useTabName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname)
		.replace(/[\/\.]+/g, '-')
		.replace(/^-|-$/g, '')
	,
};

function containsValueMetric({ entries }) {
	let result = false;

	if (entries) {
		let idx = entries.length;

		while (idx--) {
			if (entries[idx].name === 'value') {
				result = true;
				break;
			}
		}
	}

	return result;
}

export function isBadTiming(entry: PerfEntry): boolean {
	return (
		entry.start === null ||
		entry.end === null ||
		// Находим такую корневую entry, у которой entry.entries[..., { name: 'value' }, ...]
		// такие метрики дают дубли при формировании финального имени
		(entry.parent === null && containsValueMetric(entry))
	);
}

export function getOption<
	O extends AnalyticsOptions,
	N extends keyof O
>(options: O | undefined, name: N): O[N] | undefined {
	return options && (name in options)
		? options[name]
		: (baseAnalyticsOptions as O)[name]
	;
}
