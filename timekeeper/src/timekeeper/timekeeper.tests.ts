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
		mark: '[tk] label 0',
		measure: '[tk] label',
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

		it('grouped', async () => {
			await keeper.group('app', async (grouped) => {
				keeper.time('timeout');

				await new Promise(resolve => {
					grouped(() => {
						keeper.timeEnd('timeout');
						keeper.time('any');
						keeper.timeEnd('any');
						resolve();
					});
				});
			});

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
		'[tk] inline: 1.000ms',
		'group:[tk] app: 10.000ms',
		'group:[tk] head: 5.000ms',
		'[tk] css: 3.000ms',
		'group:[tk] js: 1.000ms',
		'groupEnd',
		'groupEnd',
		'[tk] body: 1.000ms',
		'groupEnd',
	]);
});