export const globalThis = Function('return this')() as Window;

export type AnalyticsOptions = {
	prefix?: string;
	useTabName?: (location: Location) => string;
}

const baseAnalyticsOptions: AnalyticsOptions = {
	prefix: '',
	useTabName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname)
		.replace(/[\/\.]+/g, '-')
		.replace(/^-|-$/g, '')
	,
};

export function getOption<
	O extends AnalyticsOptions,
	N extends keyof O
>(options: O | undefined, name: N): O[N] | undefined {
	return options && (name in options)
		? options[name]
		: (baseAnalyticsOptions as O)[name]
	;
}
