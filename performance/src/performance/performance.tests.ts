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

describe('measure partial args', () => {
	it('only name', () => {
		const name = `_${Math.random()}`;
		const ts = perf.now();
		perf.measure(name);
		expect(perf.getEntriesByName(name)[0].startTime).toEqual(ts);
	});

	it('only start', async () => {
		const name = `_${Math.random()}`;
		const start = `_${Math.random()}`;
		const ts = perf.now();
		perf.mark(start);
		await pause(10);
		perf.measure(name, start);
		expect(perf.getEntriesByName(name)[0].startTime).toEqual(ts);
		expect(perf.getEntriesByName(name)[0].duration).toBeGreaterThanOrEqual(10);
	});
});

describe('errors', () => {
	function errMsg(val) {
		return `Failed to execute 'measure' on 'Performance': The mark '${val}' does not exist.`
	}

	it('measure: name', () => {
		let err: Error = new Error('ok');
		try {
			(perf as any).measure();
		} catch (val) {
			err = val;
		}

		expect(err.message).toBe(`Failed to execute 'measure' on 'Performance': 1 argument required, but only 0 present.`);
	});

	it('measure: first', () => {
		const first = `_${Math.random()}`;
		let err: Error = new Error('ok');
		try {
			perf.measure('test', first);
		} catch (val) {
			err = val;
		}

		expect(err.message).toBe(errMsg(first));
	});

	it('measure: second', () => {
		const first = `_${Math.random()}`;
		const second = `_${Math.random()}`;
		let err: Error = new Error('ok');
		try {
			perf.mark(first);
			perf.measure('test', first, second);
		} catch (val) {
			err = val;
		}

		expect(err.message).toBe(errMsg(second));
	});

	it('measure: clear', () => {
		const first = `_${Math.random()}`;
		let err: Error = new Error('ok');
		try {
			perf.mark(first);
			perf.clearMarks(first);
			perf.measure('test', first, first);
		} catch (val) {
			err = val;
		}

		expect(err.message).toBe(errMsg(first));
	});
});

function pause(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	});
}