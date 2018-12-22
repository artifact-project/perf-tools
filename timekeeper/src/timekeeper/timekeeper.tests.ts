import { create } from './timekeeper';
import { performance } from '@perf-tools/performance';

describe('time', () => {
	let ts = 0;
	const warn = [];
	const keeper = create({
		timeline: true,
		perf: {
			...performance,
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
		Object.entries(expected).forEach(([key, val]) => {
			expect(`${key}:${JSON.stringify(val)}`).toBe(`${key}:${JSON.stringify(keeper.entries[0][key])}`);
		});
		expect(keeper.entries.length).toEqual(1);

		keeper.timeEnd('label');
		expect(keeper.entries.length).toEqual(1);
		expect(keeper.entries[0].end).toEqual(2);
		expect(warn).toEqual([]);
	});

	it('timeEnd: warn', () => {
		expect(warn.length).toBe(0);
		keeper.timeEnd('labelxxx');
		expect(warn.length).toBe(1);
	});

	it('stop', () => {
		const length = keeper.entries.length;
		const timeLabel = keeper.time('label');

		timeLabel.stop();
		expect(keeper.entries.length).toBe(length + 1);
	});
});

describe('group', () => {
	let ts = 0;
	const warn = [];
	const keeper = create({
		timeline: true,
		perf: {
			...performance,
			now: () => ++ts,
		},
		console: {
			warn: (val) => warn.push(val),
		},
	});

	beforeEach(() => {
		ts = 0;
		keeper.entries.length = 0;
	});

	it('groupEntry', () => {
		const gapp = keeper.group('app');
		gapp.stop();

		expect(keeper.entries[0].active).toBe(0);
		expect(keeper.entries[0].end).toBe(ts);
	});

	it('empty', () => {
		keeper.group('app');
		keeper.groupEnd();

		expect(keeper.entries[0].active).toBe(0);
		expect(keeper.entries[0].end).toBe(ts);
	});

	it('nested: classic', () => {
		keeper.group('app');
		keeper.group('head');
		keeper.time('css');
		keeper.timeEnd('css');
		keeper.groupEnd();

		keeper.time('body');
		keeper.timeEnd('body');
		keeper.groupEnd();

		expect(`root:${keeper.entries.length}`).toBe(`root:1`);
		expect(`group:${keeper.entries[0].entries.length}`).toBe(`group:2`);
		expect(keeper.entries[0].active).toBe(0);
		expect(keeper.entries[0].end).toBe(ts);
	});

	it('nested: modern', () => {
		const gapp = keeper.group('app');
		const ghead = gapp.group('head');

		ghead.time('css').stop();
		ghead.stop();

		gapp.time('body').stop();
		gapp.stop();

		expect(`root:${keeper.entries.length}`).toBe(`root:1`);
		expect(`group:${keeper.entries[0].entries.length}`).toBe(`group:2`);
		expect(keeper.entries[0].active).toBe(0);
		expect(keeper.entries[0].end).toBe(ts);
	});

	it('nested: warn', () => {
		const gapp = keeper.group('app');
		gapp.time('head').stop();
		gapp.stop();
		gapp.time('body').stop();

		expect(warn).toEqual([`[timekeeper] Group \"app\" is stopped`]);
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

it('disabled', () => {
	const keeper = create({
		disabled: true,
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

	keeper.group('root').stop();
	expect(keeper.entries.length).toBe(0);
});

it('time warn', () => {
	const warn = [];
	const keeper = create({
		warn: (m) => warn.push(m),
	});

	keeper.timeEnd('inner');
	keeper.groupEnd('root');

	expect(warn).toEqual([
		"[timekeeper] Timer \"inner\" doesn't exist",
		"[timekeeper] Group \"root\" not found",
	]);
});