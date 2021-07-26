import { create, Options, Entry } from './core';

describe('time', () => {
	it('time', () => {
		const keeper = createKeeper();
		const entry = keeper.time('timer-name-1');
		expect(entry).toEqual({
			id: 2,
			name: 'timer-name-1',
			start: 1,
			end: null,
			unit: 'ms',
			parent: null,
		});
	});

	it('time with unit', () => {
		const keeper = createKeeper();
		const entry = keeper.time('timer-name-1', 'fps');
		expect(entry).toEqual({
			id: 2,
			name: 'timer-name-1',
			start: 1,
			end: null,
			unit: 'fps',
			parent: null,
		});
	});

	it('timeEnd', () => {
		const keeper = createKeeper();
		const entry = keeper.time('timer-name-2');
		
		keeper.timeEnd('timer-name-2');
		
		expect(entry).toEqual({
			id: 2,
			name: 'timer-name-2',
			start: 1,
			end: 2,
			unit: 'ms',
			parent: null,
		});
	});

	it('stop', () => {
		const keeper = createKeeper();
		const entry = keeper.time('timer-name-3');
		
		entry.stop();
		
		expect(entry).toEqual({
			id: 2,
			name: 'timer-name-3',
			start: 1,
			end: 2,
			parent: null,
			unit: 'ms',
		});
	});

	describe('meta', () => {
		it('add', () => {
			const keeper = createKeeper();
			const entry = keeper.add('meta-add-1', 0, 1, undefined, {method: 'add'});
			expect(entry.meta).toEqual({method: 'add'});
		});

		it('time', () => {
			const keeper = createKeeper();
			const entry = keeper.time('meta-time-1');
			keeper.timeEnd('meta-time-1', undefined, {method: 'time'});
			expect(entry.meta).toEqual({method: 'time'});
		});

		it('stop', () => {
			const keeper = createKeeper();
			const entry = keeper.time('meta-stop-1');
			expect(entry.stop(undefined, {method: 'stop'}).meta).toEqual({method: 'stop'});
		});

		it('group', () => {
			const keeper = createKeeper();
			const entry = keeper.group('meta-group-1');
			keeper.groupEnd('meta-group-1', undefined, {method: 'group'});
			expect(entry.meta).toEqual({method: 'group'});
		});
	});

	it('addons', () => {
		const logs = [] as Entry[];
		const keeper = createKeeper();

		keeper.addons.push({
			start: (entry) => logs.push({...entry}),
			end: (entry) => logs.push({...entry}),
		});
		keeper.time('timer-addon-1', 'ms').stop();
		
		expect(logs).toEqual([
			{id: 2, name: 'timer-addon-1', start: 1, end: null, parent: null, unit: 'ms'},
			{id: 2, name: 'timer-addon-1', start: 1, end: 2, parent: null, unit: 'ms'},
		]);
	});

	describe('warning', () => {
		it('time', () => {
			const log = [] as string[];
			const keeper = createKeeper({warn: (msg) => { log.push(msg) }});
			
			keeper.time('timer-name-1');
			keeper.time('timer-name-1');
			
			expect(log).toEqual([`Timer 'timer-name-1' exists`]);
		});
		
		it('timeEnd', () => {
			const log = [] as string[];
			const keeper = createKeeper({warn: (msg) => { log.push(msg) }});
			
			keeper.timeEnd('timer-name-1');
			
			keeper.time('timer-name-2');
			keeper.timeEnd('timer-name-2');
			keeper.timeEnd('timer-name-2');
			
			expect(log).toEqual([
				`Timer 'timer-name-1' not exists`,
				`Timer 'timer-name-2' not exists`,
			]);
		});

		it('stop + timeEnd', () => {
			const log = [] as string[];
			const keeper = createKeeper({warn: (msg) => { log.push(msg) }});
			
			keeper.time('timer-name-3').stop();
			keeper.timeEnd('timer-name-3');
			
			expect(log).toEqual([`Timer 'timer-name-3' not exists`]);
		});
	});
});

describe('group', () => {
	it('group', () => {
		const keeper = createKeeper();
		expect(keeper.group('group-1')).toEqual({
			id: 2,
			name: 'group-1',
			parent: null,
			entries: [],
			start: 1,
			end: null,
			// active: 0,
			unit: 'ms',
		});
	});

	it('group with start', () => {
		const keeper = createKeeper();
		expect(keeper.group('group-start-1', 123).start).toEqual(123);
	});

	it('group with unit', () => {
		const keeper = createKeeper();
		expect(keeper.group('group-unit-1', 'fps').unit).toEqual('fps');
	});

	it('group with start & unit', () => {
		const keeper = createKeeper();
		const group = keeper.group('group-start-unit-1', 30, 'fps');
		expect(group.start).toEqual(30);
		expect(group.unit).toEqual('fps');
	});
	
	it('groupEnd', () => {
		const keeper = createKeeper();
		const group = keeper.group('group-start-end');

		keeper.groupEnd('group-start-end');

		expect(group).toEqual({
			id: 2,
			name: 'group-start-end',
			parent: null,
			entries: [],
			start: 1,
			end: 2,
			// active: 0,
			unit: 'ms',
		});

		expect(keeper.group('nexted').parent).toEqual(null);
	});

	it('stop', () => {
		const keeper = createKeeper();
		const group = keeper.group('group-start-stop');

		group.stop()

		expect(group).toEqual({
			id: 2,
			name: 'group-start-stop',
			parent: null,
			entries: [],
			start: 1,
			end: 2,
			// active: 0,
			unit: 'ms',
		});

		expect(keeper.group('nexted').parent).toEqual(null);
	});

	it('stop with time', () => {
		const keeper = createKeeper();
		const group = keeper.group('first');

		group.stop(321);
		expect(group.end).toBe(321);
	});

	describe('warning', () => {
		it('groupEnd without name', () => {
			const log = [] as string[];
			const keeper = createKeeper({warn: (v) => { log.push(v); }});
			
			keeper.group('first');
			keeper.groupEnd(undefined as any as string);

			expect(log).toEqual([`Timer 'undefined' not exists`])
		});
	});

	describe('isolate', () => {
		it('group without isolate', () => {
			const keeper = createKeeper();
			const group = keeper.group('group-without-isolate-1');
			const nested = group.group('nested-1');
			
			expect(group.parent).toEqual(null);
			// expect(group.active).toEqual(1);
			expect(group.entries).toEqual([nested]);
			expect(nested.parent).toBe(group);

			const other = keeper.group('nested-2');
			expect(other.parent).toBe(nested);
		});

		it('group with isolate', () => {
			const keeper = createKeeper();
			const group = keeper.group('group-without-isolate');
			const isolate = group.group('group-with-isolate', true);
			
			expect(group.entries).toEqual([]);
			expect(isolate.parent).toEqual(null);
		});
	});
});

describe('nested', () => {
	describe('without isolate', () => {
		it('depth 1', () => {
			const keeper = createKeeper();
			const group = keeper.group('root-1');
			const nested1 = keeper.time('nested-timer-1');
			const nested2 = group.time('nested-timer-2');

			nested1.stop();
			nested2.stop();
			group.stop();
			
			expect(nested1.parent).toEqual(group);
			expect(nested2.parent).toEqual(group);
			expect(keeper.time('timer-3').parent).toEqual(null);
			expect(group.entries).toEqual([nested1, nested2]);
		});

		it('multi group', () => {
			const keeper = createKeeper();
			const root = keeper.group('root-1');
			const nested1 = keeper.time('nested-timer-1');
			const nestedGroup1 = keeper.group('nested-group-1');
			const nested2 = keeper.time('nested-timer-2');
			const nestedGroup2 = keeper.group('nested-group-2');
			const nested3 = nestedGroup2.time('nested-timer-3');

			nested1.stop();
			nested2.stop();
			nested3.stop();

			nestedGroup2.stop();
			nestedGroup1.stop();
			root.stop();
			
			expect(root.parent).toEqual(null);
			expect(root.entries).toEqual([nested1, nestedGroup1]);

			expect(nestedGroup1.parent).toEqual(root);
			expect(nestedGroup1.entries).toEqual([nested2, nestedGroup2]);

			expect(nestedGroup2.parent).toEqual(nestedGroup1);
			expect(nestedGroup2.entries).toEqual([nested3]);
		});
	});
});

function createKeeper(opts?: Options) {
	let time = 0;

	return create({
		now: () => ++time,
		...Object(opts),
	});
}

// it('time with executer', () => {
// 	const keeper = createKeeper();
// 	const entry = keeper.time('timer-with-executer', () => {
// 	});
	
// 	expect(entry).toEqual({
// 		id: 1,
// 		name: 'timer-with-executer',
// 		start: 1,
// 		end: 2,
// 		unit: undefined,
// 	});
// });

// it('time with unit and executer', () => {
// 	const keeper = createKeeper();
// 	const entry = keeper.time('timer-with-kb-executer', () => {
// 	}, 'KB');
	
// 	expect(entry).toEqual({
// 		id: 1,
// 		name: 'timer-with-kb-executer',
// 		start: 1,
// 		end: 2,
// 		unit: 'KB',
// 	});
// });
