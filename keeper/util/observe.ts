export const observe = (
	type: string,
	handler: (entry: PerformanceEntry) => void,
) => {
	let po: PerformanceObserver | undefined

	try {
		po = new PerformanceObserver((batch) => {
			// console.log('🌀', type, batch.getEntries())
			batch.getEntries().map(handler);
		});

		po.observe({
			type,
			buffered: true,
		});
	} catch {}

	return po;
};

export const disconnect = (po: PerformanceObserver | undefined) => {
	po && po.disconnect();
};

export const takeRecords = (
	po: PerformanceObserver | undefined,
	handler: (entry: PerformanceEntry) => void,
) => {
	try {
		po && po.takeRecords().map(handler);
	} catch {}
};
