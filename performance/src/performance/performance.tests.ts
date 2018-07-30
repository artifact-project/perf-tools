import { performance as perf } from './performance';

it('performance.now()', async () => {
	expect(perf.now()).toBeGreaterThanOrEqual(0);

	await pause(10);
	expect(perf.now()).toBeGreaterThanOrEqual(10);
});

describe('performance: mark and measure', () => {
	beforeAll(async () => {
		perf.mark('foo');
		await pause(16);
		perf.mark('bar');
		perf.measure('foo-bar', 'foo', 'bar');
	});

	describe('getEntries', async () => {
		it('all', () => {
			expect(perf.getEntries().length).toBe(3);
		});

		it('with filter', () => {
			expect(perf.getEntries({entryType: 'measure', name: 'xfoo-bar'}).length).toBe(0);
			expect(perf.getEntries({entryType: 'measure', name: 'foo-bar'})[0].duration).toBeGreaterThanOrEqual(16);
		});
	});

	it('getEntriesByName', () => {
		expect(perf.getEntriesByName('foo')[0].entryType).toBe('mark');
	});

	it('getEntriesByType', () => {
		expect(perf.getEntriesByType('mark').length).toBe(2);
	});

	it('clearMarks', () => {
		perf.clearMarks();
		expect(perf.getEntries().length).toBe(1);
	});

	it('clearMeasures', () => {
		perf.clearMeasures();
		expect(perf.getEntries().length).toBe(0);
	});

	it('clearResourceTimings', () => {
		perf.clearResourceTimings();
	});
});

function pause(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	});
}