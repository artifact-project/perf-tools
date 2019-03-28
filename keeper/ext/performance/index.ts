import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, globalThis, createTamingsGroup, now } from '../utils';

export type PerformanceOptions = {
	minLatency: number;
	ttiDelay: number;
}

export const defaultPerformanceOptions: PerformanceOptions = {
	minLatency: 100,
	ttiDelay: 2000,
};

type Batch = {
	start: 0,
	end: 0,
	nested: Array<[string, number, number]>;
};

export function performanceTimings(keeper: PerfKeeper, options: PerformanceOptions = defaultPerformanceOptions) {
	let batch = {} as Batch;
	let lock = false;
	const [set, flush] = createTamingsGroup('pk-performance', keeper);
	const firstWinEvents = [
		'click',
		'touchup',
		'submit',

		'abort',
		'blur',
		'contextmenu',
		'deviceorientation',
		'offline',
		'online',
		'paint',
		'popstate',
		'resize',
		'wheel',
		'scroll',
	];

	function sendTimings() {
		Object.keys(batch).forEach(key => {
			const item = batch[key];

			item.values.forEach(t => {
				set(t[0], t[1], t[2]);
			});

			flush(key, item.start, item.end, true);
		});

		batch = {} as Batch;
		lock = false;
	}

	function send(groupName: string, label: string,  start: number = 0, end: number = now()) {
		const item = (batch[groupName] = batch[groupName] || {
			start: 0,
			end: 0,
			values: [],
		});

		item.start = Math.min(item.start, start);
		item.end = Math.max(item.end, end);
		item.values.push([label, start, end]);

		!lock && setTimeout(sendTimings);
		lock = true;
	}

	// Window
	once(firstWinEvents, (eventType) => {
		send(`first-${eventType}`, 'value');
	});

	// Tab unload
	once(['beforeunload'], () => {
		send(`tab-unload`, 'value');
	});

	// Latency
	[
		'click',
		'touchup',
		'input',
		'submit',
		'resize',
		'scroll',
	].forEach((eventType) => {
		let start: number;

		function calc() {
			const end = now();

			if (end - start >= options.minLatency) {
				set('value', start, end);
				flush(`latency-${eventType}`, start, end, true);
			}
		}

		globalThis.addEventListener(eventType, () => {
			start = now();
			requestAnimationFrame(calc);
		}, true);
	});

	// TTI
	let ttiLastEntry: PerformanceEntry | undefined;
	let ttiPerfObserver: PerformanceObserver;

	try {
		ttiPerfObserver = new PerformanceObserver((list) => {
			ttiLastEntry = list.getEntries().pop();
		});

		ttiPerfObserver.observe({
			entryTypes: ['longtask'],
		});
	} catch (_) {}

	// After DOM Ready
	domReady(() => {
		// TTI Check
		if (ttiPerfObserver) {
			let tti: number;
			const check = () => {
				if (ttiLastEntry) {
					tti = ttiLastEntry.startTime + ttiLastEntry.duration;

					if (now() - tti >= options.ttiDelay) {
						send(`tti`, 'value', 0, tti);
						ttiPerfObserver.disconnect();
					} else {
						setTimeout(check, options.ttiDelay);
					}
				} else if (tti) {
					send(`tti`, 'value', 0, tti);
					ttiPerfObserver.disconnect();
				} else {
					// Небыло лонг тасков, поэтому делаем паузу и если их опять не будет,
					// то считает, что приложение уже готово на момент DOMReady!
					tti = now();
					setTimeout(check, 500);
				}
			}

			check();
		}

		// Events
		once(firstWinEvents, (eventType) => {
			send(`first-${eventType}`, `after-ready`);
		});
	});
}

function once(events: string[], fn: (eventType: string, evt: Event) => void, ctx?: Document | Window) {
	events.forEach(type => {
		const handle = (evt) => {
			globalThis.removeEventListener(type, handle, true);
			fn(type, evt);
		};

		(ctx = ctx || globalThis).addEventListener(type, handle, true);
	});
}