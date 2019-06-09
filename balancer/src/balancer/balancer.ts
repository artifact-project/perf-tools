export type Cancelable = {cancel(): void};

export type Task = {
	fn: Function;
	ctx: object;
	args: any[];
	flags: number;
	duration: number;
}

export type TaskUniqueKey = {
	cid: number;
	name: string;
	task: Task;
};

export type TaskOptions = {
	key?: TaskUniqueKey;
	flags?: number;
}

let perf: {now(): number};
let requestFrame: (fn: () => void) => number;
let cancelNextFrame: (pid: number) => void;
let requestIdle: (fn: () => void) => void;

if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
	perf = performance;
} else {
	perf = {
		now: Date.now,
	};
}

if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
	requestFrame = requestAnimationFrame;
	cancelNextFrame = cancelAnimationFrame;
} else {
	requestFrame = function requestFramePolyfill(fn) {
		return setTimeout(fn, 16);
	};
	cancelNextFrame = clearTimeout;
}

if (typeof requestIdleCallback === 'function') {
	requestIdle = function requestIdlePolyfill(fn) {
		requestIdleCallback(fn, {
			timeout: 60,
		});
	};
} else {
	requestIdle = function requestIdlePolyfill(fn) {
		setTimeout(fn, 60);
	};
}

const F_CTX = 1 << 1;
const F_ARGS = 1 << 2;
const F_STACKED = 1 << 3;
const F_CANCELED = 1 << 4;
const F_HEAVY = 1 << 5;
const F_DEBOUNCED = 1 << 6;
const F_IMPORTANT = 1 << 7;
const F_NO_ARGS = 1 << 8;

const stack: Task[] = [];
const idleStack: Task[] = [];
const stats = {
	time: 0,
	total: 0,
	reset() {
		this.time = perf.now();
		this.total = 0;
	},
};

const EMPTY_ARGS = [];
const __INLINE_FLAGS__ = '__@perf-tools/balancer__';

let cid = 0;
let MAX_FRAME_SIZE = 13;
let interactive = false;
let idleInteractive = false;

let size = 0;
let idleSize = 0;

function noop() {
}

function createTask(fn: Function, ctx: object, initialArgs: any[], options: TaskOptions): Task {
	let flags: number;
	let uniqueKey: TaskUniqueKey;

	if (options != null) {
		flags = options.flags;
		uniqueKey = options.key;
	}

	const task: Task = (uniqueKey != null)
		? uniqueKey.task
		: {fn: noop, ctx: null, args: null, flags: 0, duration: 0}
	;

	task.fn = fn;
	task.ctx = ctx;
	task.args = initialArgs;
	task.flags = (
		task.flags |
		flags |
		(ctx && F_CTX) |
		(initialArgs && initialArgs.length && F_ARGS) |
		(fn.hasOwnProperty(__INLINE_FLAGS__) ? fn[__INLINE_FLAGS__] : 0)
	);

	return task;
}

function add(task: Task): Task {
	task.flags |= F_STACKED;

	if ((task.flags & F_HEAVY) && !(task.flags & F_IMPORTANT)) {
		idleSize = idleStack.push(task);

		if (idleInteractive === false) {
			idleInteractive = true;
			requestIdle(idleNext);
		}
	} else {
		size = stack.push(task);

		if (interactive === false) {
			interactive = true;
			requestFrame(next);
		}
	}

	return task;
}

function call(fn: Function, ctx?: object, args?: any[], options?: TaskOptions): Task {
	const task = createTask(fn, ctx, args, options);
	return (task.flags & F_STACKED) ? task : add(task);
}

function debounce<T extends (...args: any[]) => any>(
	fn: T,
	ctx?: object,
	initialArgs: any[] = EMPTY_ARGS,
	options?: TaskOptions,
): T & Cancelable {
	const task = createTask(fn, ctx, initialArgs, options);
	const freeCtx = (task.flags & F_CTX) === 0;
	const hasInitialArgs = (task.flags & F_ARGS) !== 0;

	const debounced: (T & Cancelable) = <any>function debounced() {
		let flags = task.flags;

		if ((flags & F_NO_ARGS) === 0) {
			let argsLen = arguments.length;

			if (argsLen) {
				task.args = initialArgs.slice(0);

				for (let i = 0; i < argsLen; i++) {
					task.args.push(arguments[i]);
				}
			} else {
				task.args = initialArgs;
			}

			flags = (hasInitialArgs || argsLen) ? (flags | F_ARGS) : (flags & ~F_ARGS);
		}

		if (freeCtx) {
			task.ctx = this;
		}

		flags = task.ctx == null ? (flags & ~F_CTX) : (flags | F_CTX);

		task.flags = flags;

		if (flags & F_STACKED) {
			// Nothing not to do
		} else {
			add(task);
		}
	};

	task.flags |= F_DEBOUNCED;

	debounced.cancel = () => {
		cancel(task);
	};

	return debounced;
}

function isKey(val: Task | TaskUniqueKey): val is TaskUniqueKey {
	return val.hasOwnProperty('task');
}

function cancel(taskOrKey: Task | TaskUniqueKey) {
	if (isKey(taskOrKey)) {
		cancel(taskOrKey.task);
	} else {
		taskOrKey.flags |= F_CANCELED;
	}
}

function uniqueKey(name): TaskUniqueKey {
	cid++;

	return {
		cid,
		name,
		task: createTask(noop, null, null, null)
	};
}

function exec(task: Task) {
	const {fn, ctx, args} = task;

	task.flags ^= F_STACKED;

	if (task.flags & F_CANCELED) {
		task.flags ^= F_CANCELED;
		return;
	}

	try {
		if (task.flags & F_ARGS) {
			switch (args.length) {
				case 1: fn.call(ctx, args[0]); break;
				case 2: fn.call(ctx, args[0], args[1]); break;
				case 3: fn.call(ctx, args[0], args[1], args[2]); break;
				default: fn.apply(ctx, args); break;
			}
		} else if (task.flags & F_CTX) {
			fn.call(ctx);
		} else {
			fn();
		}
	} catch (err) {
		console.error(err);
	}

	const newTime = perf.now();
	const duration = newTime - stats.time;

	task.duration = duration;
	task.flags |= duration > MAX_FRAME_SIZE ? F_HEAVY : (task.flags & ~F_HEAVY);

	if (task.flags ^ F_DEBOUNCED) {
		const inline = fn[__INLINE_FLAGS__] | 0;

		fn[__INLINE_FLAGS__] = (
			(duration > MAX_FRAME_SIZE ? inline | F_HEAVY : inline & ~F_HEAVY)
		);
	}

	stats.time = newTime;
	stats.total += duration;
}

function next() {
	let i = 0;

	stats.reset();

	for (; i < size; i++) {
		exec(stack[i]);

		if (stats.total >= MAX_FRAME_SIZE) {
			i++;
			break;
		}
	}

	size -= i;

	if (size > 0) {
		stack.splice(0, i);
		requestFrame(next);
	} else {
		stack.length = 0;
		interactive = false;
	}
}

function idleNext() {
	stats.reset();

	for (let i = 0; i < idleSize; i++) {
		exec(idleStack[i]);
	}

	idleInteractive = false;
	idleStack.length = 0;
}

type SetupOptions = Partial<{
	maxFrameSize: number;
}>;

function setup(options: SetupOptions) {
	MAX_FRAME_SIZE = options.maxFrameSize || MAX_FRAME_SIZE;
}

// API
export {
	F_NO_ARGS,
	F_IMPORTANT,

	setup,
	SetupOptions,

	perf,
	call,
	debounce,
	cancel,
	uniqueKey,
	requestFrame,
	requestIdle,
};
