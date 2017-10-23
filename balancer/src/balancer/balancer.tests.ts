import {call, cancel, uniqueKey, debounce, F_IMPORTANT, perf, requestFrame, requestIdle, F_NO_ARGS} from './balancer';

async function frame(idle = false) {
	return new Promise(resolve => {
		(idle ? requestIdle : requestFrame)(resolve)
	});
}

function freeze(ms) {
	const start = perf.now();

	while (perf.now() - start < ms) {
		// Busy
	}
}

it('call', async () => {
	const log = [];

	call(function (...args) { log.push(['first', this, args]); });
	call(function (...args) { log.push(['second', this, args]); }, {foo: 'bar'});
	call(function (...args) { log.push(['third', this, args]); }, {bar: 'qux'}, [1, 2, 3]);
	call(function (...args) { log.push(['fourthly', this, args]); }, null, [1, 2, 3]);

	expect(log).toEqual([]);

	await frame();

	expect(log).toEqual([
		['first', void 0, []],
		['second', {foo: 'bar'}, []],
		['third', {bar: 'qux'}, [1, 2, 3]],
		['fourthly', null, [1, 2, 3]],
	]);
});

it('next frame', async () => {
	const log = [];

	call(() => {
		log.push(1);
		freeze(10);
	});

	call(() => {
		log.push(2);
		freeze(10);
	});

	call(() => {
		log.push(3);
	});

	expect(log).toEqual([]);
	await frame();
	expect(log).toEqual([1, 2]);

	await frame();
	expect(log).toEqual([1, 2, 3]);

	await frame();
	expect(log).toEqual([1, 2, 3]);
});

it('idle', async () => {
	const log = [];
	const light = (arg) => {log.push(arg);};

	const heavy = (fast) => {
		log.push(`heavy${fast ? '->fast' : ''}`);
		!fast && freeze(30);
	};

	call(light, null, ['light-1']);
	call(heavy);
	call(light, null, ['light-2']);

	expect(log).toEqual([]);
	await frame();
	expect(log).toEqual(['light-1', 'heavy']);

	await frame();
	expect(log).toEqual(['light-1', 'heavy', 'light-2']);

	log.length = 0;
	call(light, null, ['light-3']);
	call(heavy, null, [true]);
	call(light, null, ['light-4']);

	await frame();
	expect(log).toEqual(['light-3', 'light-4']);

	await frame(true);
	expect(log).toEqual(['light-3', 'light-4', 'heavy->fast']);

	log.length = 0;
	call(light, null, ['light-5']);
	call(heavy, null, [true]);
	call(light, null, ['light-6']);

	await frame(true);
	expect(log).toEqual(['light-5', 'heavy->fast', 'light-6']);
});

it('cancel', async () => {
	const log = [];
	const task = call(function () { log.push('fail'); });

	expect(log).toEqual([]);
	cancel(task);

	await frame();

	expect(log).toEqual([]);
});

it('F_IMPORTANT', async () => {
	const log = [];
	const fn = function (val) {
		log.push(val);
		freeze(30);
	};

	call(fn, null, [1], {flags: F_IMPORTANT});
	expect(log).toEqual([]);

	await frame();
	expect(log).toEqual([1]);

	call(fn, null, [2], {flags: F_IMPORTANT});
	await frame();
	expect(log).toEqual([1, 2]);
});

it('F_NO_ARGS', async () => {
	const log = [];
	const fn = debounce(
		function (...args) { log.push(args); },
		null,
		['initial'],
		{flags: F_NO_ARGS},
	);

	fn(1, 2, 3);

	expect(log).toEqual([]);
	await frame();
	expect(log).toEqual([['initial']]);
});

describe('debounce', () => {
	it('without args', async () => {
		const log = [];
		const fn = debounce(function () { log.push(arguments.length); });

		fn();
		fn();
		fn();

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([0]);
	});

	it('with one arg', async () => {
		const log = [];
		const fn = debounce(function (...args) { log.push(arguments.length, args); });

		fn(1);
		fn(2);

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([1, [2]]);
	});

	it('with two args', async () => {
		const log = [];
		const fn = debounce(function (...args) { log.push(arguments.length, args); });

		fn(1);
		fn(1, 2);

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([2, [1, 2]]);
	});

	it('with three args', async () => {
		const log = [];
		const fn = debounce(function (...args) { log.push(arguments.length, args); });

		fn(1);
		fn(1, 2);
		fn(1, 2, 3);

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([3, [1, 2, 3]]);
	});

	it('with many args', async () => {
		const log = [];
		const fn = debounce(function (...args) { log.push(arguments.length, args); });

		fn(1, 2, 3, 4);

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([4, [1, 2, 3, 4]]);
	});

	it('with initial args', async () => {
		const log = [];
		const fn = debounce(function (...args) {
			log.push(arguments.length, args);
		}, null, ['foo', 'bar']);

		fn();

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([2, ['foo', 'bar']]);

		log.splice(0, 2);
		fn('extra');
		await frame();
		expect(log).toEqual([3, ['foo', 'bar', 'extra']]);
	});

	it('with ctx', async () => {
		const log = [];
		const ctx = {
			fail: true,
			fn: debounce(function (...args) {log.push(arguments.length, this);}, {foo: 'bar'}),
		};

		ctx.fn();

		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([0, {foo: 'bar'}]);
	});

	it('with free ctx', async () => {
		const log = [];
		const ctx = {
			fn: debounce(function (...args) {log.push(arguments.length, this);}),
		};
		const other = {
			fn : ctx.fn,
		};
		const fn = other.fn;

		ctx.fn();
		expect(log).toEqual([]);
		await frame();
		expect(log).toEqual([0, ctx]);

		ctx.fn('a');
		log.splice(0, 2);
		await frame();
		expect(log).toEqual([1, other]);

		fn();
		log.splice(0, 2);
		await frame();
		expect(log).toEqual([0, void 0]);
	});
});

it('uniqueKey', async () => {
	const log = [];
	const label = uniqueKey('foo');
	const fn = (val) => log.push(val);

	call(fn, null, ['fail'], {key: label});
	call(fn, null, ['ok'], {key: label});

	expect(log).toEqual([]);
	await frame();
	expect(log).toEqual(['ok']);
});
