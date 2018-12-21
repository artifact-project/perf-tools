import { LazyPromise } from './promise';
import { performance } from '@perf-tools/performance';

it('instanceOf Promise', () => {
	expect(new LazyPromise(noop)).toBeInstanceOf(Promise);
});

it('instanceOf LazyPromise', () => {
	expect(new LazyPromise(noop)).toBeInstanceOf(LazyPromise);
});

it('catch', async () => {
	const val = await new LazyPromise((_, reject) => {
		reject('REJECTED');
	}).catch(val => `${val} and RESOLVED`);

	expect(val).toBe('REJECTED and RESOLVED');
});

it('finally', async () => {
	let val = '';
	await new LazyPromise((resolve) => {
		resolve('OK');
	}).finally(() => {
		val = `finally`;
	});

	expect(val).toEqual('finally');
});

describe('sync', () => {
	it('resolve', async () => {
		expect(await new LazyPromise((resolve) => {
			resolve('OK');
		})).toBe('OK');
	});

	it('reject', async () => {
		try {
			expect(await new LazyPromise((_, reject) => {
				reject('REJECTED');
			})).toBe('Failed!');
		} catch (err) {
			expect(err).toBe('REJECTED');
		}
	});
});

describe('async', () => {
	it('resolve', async () => {
		expect(await new LazyPromise((resolve) => {
			setTimeout(() => {
				resolve('AsyncOK');
			}, 16);
		})).toBe('AsyncOK');
	});

	it('reject', async () => {
		try {
			expect(await new LazyPromise((_, reject) => {
				setTimeout(() => {
					reject('AsyncREJECTED');
				}, 16);
			})).toBe('Failed!');
		} catch (err) {
			expect(err).toBe('AsyncREJECTED');
		}
	});
});

describe('benchmark', () => {
	const MAX = 1e5;
	const values = Array.from({length: MAX}).map(() => Math.random());

	describe('constructor', () => {
		const lazy = [];
		const native = [];

		let lazyTime = -performance.now();
		for (let i = 0; i < MAX; i++) {
			lazy.push(new LazyPromise(noop));
		}
		lazyTime += performance.now()
		expect(lazy.length).toBe(MAX);

		let nativeTime = -performance.now();
		for (let i = 0; i < MAX; i++) {
			native.push(new Promise(noop));
		}
		nativeTime += performance.now()
		expect(native.length).toBe(MAX);

		it(`${lazyTime}ms > ${nativeTime}ms`, () => {
			expect(lazyTime).toBeLessThan(nativeTime);
		});

		it(`Lazy vs. Native: ${(nativeTime/lazyTime).toFixed(3)} > 1.5x`, () => {
			expect(nativeTime/lazyTime).toBeGreaterThan(1.5);
		});
	});

	describe('resolve', () => {
		const lazy = [];
		const native = [];

		let lazyTime = -performance.now();
		for (let i = 0; i < MAX; i++) {
			lazy.push(new LazyPromise(resolve => {
				resolve(values[i]);
			}));
		}
		lazyTime += performance.now()
		expect(lazy.length).toBe(MAX);

		let nativeTime = -performance.now();
		for (let i = 0; i < MAX; i++) {
			native.push(new Promise(resolve => {
				resolve(values[i]);
			}));
		}
		nativeTime += performance.now()
		expect(native.length).toBe(MAX);

		it(`${lazyTime}ms > ${nativeTime}ms`, () => {
			expect(lazyTime).toBeLessThan(nativeTime);
		});

		it(`Lazy vs. Native: ${(nativeTime/lazyTime).toFixed(3)} > 1.5x`, () => {
			expect(nativeTime/lazyTime).toBeGreaterThan(1.5);
		});
	});
});


function noop() {

}