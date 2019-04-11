import { PerfEntry } from "../src/keeper/keeper";

export const globalThis = Function('return this')() as Window;

export type AnalyticsOptions = {
	prefix?: string;
	sendZeroValues?: boolean;
	useTabName?: (location: Location) => string;
}

const baseAnalyticsOptions: AnalyticsOptions = {
	prefix: '',
	sendZeroValues: false,
	useTabName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname)
		.replace(/[\/\.]+/g, '-')
		.replace(/^-|-$/g, '')
	,
};

export function isBadTiming(entry: PerfEntry): boolean {
	return entry.start === null || entry.end === null;
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
