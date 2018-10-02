import { create } from './timekeeper';

describe('time', () => {
	let ts = 0;
	const warn = [];
	const keeper = create({
		perf: {
			now: () => ++ts,
		},
		console: {
			warn: (val) => warn.push(val),
		},
	});
	const expected = {
		mark: 'label-1-mark',
		name: 'label',
		active: 0,
		start: 1,
		end: 0,
		parent: null,
		entries: null,
	};

	it('normal', () => {
		expect(keeper.entries).toEqual([]);

		keeper.time('label');
		expect(keeper.entries).toEqual([expected]);

		keeper.timeEnd('label');
		expect(keeper.entries).toEqual([{
			...expected,
			end: 2,
		}]);

		expect(warn.length).toBe(0);
	});

	it('timeEnd: warn', () => {
		expect(warn.length).toBe(0);
		keeper.timeEnd('labelxxx');
		expect(warn.length).toBe(1);
	});
});

describe('group', () => {
	let ts = 0;
	const warn = [];
	const keeper = create({
		perf: {
			now: () => ++ts,
		},
		console: {
			warn: (val) => warn.push(val),
		},
	});

	beforeEach(() => {
		ts = 0;
		keeper.entries.splice(0, 1e9);
	});

	it('failed', () => {
		expect(warn.length).toBe(0);
		keeper.groupEnd();
		expect(warn.length).toBe(1);
	});

	describe('sync', () => {
		it('empty', () => {
			keeper.group('app');
			keeper.groupEnd();

			expect(keeper.entries[0].active).toBe(0);
			expect(keeper.entries[0].end).toBe(ts);
		});

		it('nested', () => {
			keeper.group('app');
			keeper.group('head');
			keeper.time('css');
			keeper.timeEnd('css');
			keeper.groupEnd();

			keeper.time('body');
			keeper.timeEnd('body');
			keeper.groupEnd();

			expect(keeper.entries[0].entries.length).toBe(2);
			expect(keeper.entries[0].active).toBe(0);
			expect(keeper.entries[0].end).toBe(ts);
		});
	});

	describe('async', () => {
		it('flat: active', () => {
			keeper.group('app');
			keeper.time('require');
			keeper.groupEnd();

			expect(keeper.entries[0].active).toBe(1);
			expect(keeper.entries[0].end).toBe(0);
		});

		it('flat: completed', () => {
			keeper.group('app');
			keeper.time('require');
			keeper.groupEnd();
			keeper.timeEnd('require');

			expect(keeper.entries[0].active).toBe(0);
			expect(keeper.entries[0].end).toBe(ts);
		});

		it('nested', () => {
			keeper.group('app');
			keeper.group('head');
			keeper.time('css');
			keeper.groupEnd();
			keeper.timeEnd('css');

			keeper.time('body');
			keeper.groupEnd();
			keeper.timeEnd('body');

			expect(keeper.entries[0].entries.length).toBe(2);
			expect(keeper.entries[0].active).toBe(0);
			expect(keeper.entries[0].end).toBe(ts);
		});

		it('wrap', async () => {
			keeper.group('app');
			await keeper.wrap(async ()  => {
				keeper.time('timeout');

				await new Promise(keeper.wrap(resolve => {
					keeper.timeEnd('timeout');
					keeper.time('any');
					keeper.timeEnd('any');
					resolve();
				}));
			})();
			keeper.groupEnd('app');

			keeper.group('footer');
			keeper.time('metricts');
			keeper.timeEnd('metricts');
			keeper.groupEnd();

			expect(keeper.entries.map(e => e.name)).toEqual([
				'app',
				'footer',
			]);
			expect(keeper.entries[0].entries.map(e => e.name)).toEqual([
				'timeout',
				'any',
			]);
			expect(keeper.entries[1].entries.map(e => e.name)).toEqual([
				'metricts',
			]);
		});
	});
});

it('print', async () => {
	let ts = 0;
	const log = [];
	const warn = [];
	const keeper = create({
		print: true,
		perf: {
			now: () => ++ts,
		},
		console: {
			warn: (val) => warn.push(val),
			log: (...args) => log.push(args[0].replace(/%c/g, '')),
			group: (name) => log.push(`group:${name}`),
			groupEnd: () => log.push(`groupEnd`),
		},
	});

	keeper.time('inline');
	keeper.timeEnd('inline');
	keeper.group('app');
	keeper.group('head');
	keeper.time('css');
	keeper.group('js');
	keeper.groupEnd('js');
	keeper.groupEnd();
	keeper.timeEnd('css');

	keeper.time('body');
	keeper.groupEnd();
	keeper.timeEnd('body');

	await new Promise(resolve => setTimeout(resolve, 10));

	expect(warn.length).toBe(0);
	expect(log.length).toBeGreaterThan(0);
	expect(log).toEqual([
		'inline: 1.000ms',
		'group:app: %c9.000ms',
		'group:head: %c5.000ms',
		'css: 3.000ms',
		'js: 1.000ms',
		'groupEnd',
		'body: 1.000ms',
		'groupEnd',
	]);
});

describe('perf', () => {
	let ts = 0;
	const perf = [];
	const keeper = create({
		timeline: true,
		prefix: '',
		perf: {
			now: () => ++ts,
			mark: (name) => perf.push(name),
			measure: (name, mark) => perf.push(`${name}:${mark}`),
			clearMarks: (name) => perf.push(`clearMarks:${name}`),
			clearMeasures: (name) => perf.push(`clearMeasures:${name}`),
		},
	});

	beforeEach(() => {
		ts = 0;
		perf.length = 0;
		keeper.entries.length = 0;
	});

	it('empty', () => {
		keeper.group('root');
		keeper.groupEnd('root');

		expect(perf).toEqual([
			'root-1-mark',
			'root:root-1-mark',
			'clearMarks:root-1-mark',
			'clearMeasures:root',
		]);
	});

	it('sync', () => {
		keeper.group('root');
		keeper.time('inner');
		keeper.timeEnd('inner');
		keeper.groupEnd('root');

		expect(perf).toEqual([
			'root-2-mark',

			'inner-3-mark',
			'inner:inner-3-mark',
			'clearMarks:inner-3-mark',
			'clearMeasures:inner',

			'root:root-2-mark',
			'clearMarks:root-2-mark',
			'clearMeasures:root',
		]);
	});

	it('async', () => {
		keeper.group('root');
		keeper.time('inner');
		keeper.groupEnd('root');
		keeper.timeEnd('inner');

		expect(perf).toEqual([
			'root-4-mark',

			'inner-5-mark',
			'inner:inner-5-mark',
			'clearMarks:inner-5-mark',
			'clearMeasures:inner',

			'root:root-4-mark',
			'clearMarks:root-4-mark',
			'clearMeasures:root',
		]);
	});
});

it('silent', () => {
	const keeper = create({
		silent: true,
		print: true,
		timeline: true,
		console: {},
		perf: {
			now: () => 0,
			mark: () => ({}),
			measure: () => ({}),
			clearMarks: () => ({}),
			clearMeasures: () => ({}),
		},
	});

	keeper.group('root');
	keeper.wrap(() => {
		keeper.time('foo');
		keeper.timeEnd('bar');
	})();
	keeper.groupEnd();

	expect(keeper.entries.length).toBe(0);
});