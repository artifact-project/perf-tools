export const globalThis = Function('return this')() as Window;

export type BaseAnalyticsOptions = {
	useTabName?: (location: Location) => string;
}

export const baseAnalyticsOptions: BaseAnalyticsOptions = {
	useTabName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname)
		.replace(/[\/\.]+/g, '-')
		.replace(/^-|-$/g, '')
	,
};