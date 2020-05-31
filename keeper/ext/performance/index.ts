import { PerfKeeper } from '../../src/keeper/keeper';
import { domReady, nativeGlobalThis, createTimingsGroup, now } from '../utils';

export type PerformanceOptions = Partial<{
	minLatency: number;
	ttiDelay: number;
	prefIdProp: string;
	getPerfId: (target: HTMLElement | null, prefIdProp: string) => string | null | undefined;
}>

export const defaultPerformanceOptions = {
	minLatency: 100,
	ttiDelay: 2000,
	prefIdProp: 'data-perf-id',
};

type Batch = {
	[group:string]: {
		start: number,
		end: number,
		values: Array<[string, number, number]>;
	};
};

export function performanceTimings(keeper: PerfKeeper, options: PerformanceOptions = {}) {
	let batch = {} as Batch;
	let lock = false;
	let ready = false;

	const [set, flush] = createTimingsGroup('pk-perf', keeper);
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
	const {
		minLatency = defaultPerformanceOptions.minLatency,
		ttiDelay = defaultPerformanceOptions.ttiDelay,
		getPerfId = (target: HTMLElement | null, prefIdProp: string) => {
			let id: string | null | undefined;
			while (target && !id && target.nodeType === 1) {
				id = target.getAttribute(prefIdProp);
				target = target.parentNode as HTMLElement;
			}
			return id;
		},
	} = options;

	function getId(target: EventTarget | null) {
		return getPerfId(
			target && (target as HTMLElement).nodeType === 1 ? target as HTMLElement : null,
			options.prefIdProp || defaultPerformanceOptions.prefIdProp,
		);
	}

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

	function handleClick(eventType: string, {target}: Event) {
		const id = getId(target);
		const label = `first-${eventType}${ready ? '-ready' : ''}`

		send(label, 'value');
		id && send(label, id);
	}

	// Window
	once(firstWinEvents, handleClick);

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
		nativeGlobalThis.addEventListener(eventType, ({target}) => {
			const start = now();

			requestAnimationFrame(() => {
				const end = now();

				if (end - start >= minLatency) {
					const id = getId(target);
					set('value', start, end);
					id && set(id, start, end);
					flush(`latency-${eventType}`, start, end, true);
				}
			});
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
		ready = true;

		// TTI Check
		if (ttiPerfObserver) {
			let tti: number;
			const check = () => {
				if (ttiLastEntry) {
					tti = ttiLastEntry.startTime + ttiLastEntry.duration;

					if (now() - tti >= ttiDelay) {
						// Последний logntask был давно, будем считать,
						// что эра интерактивности настала ;]
						send('tti', 'value', 0, tti);
						ttiPerfObserver.disconnect();
					} else {
						setTimeout(check, options.ttiDelay);
					}
				} else if (tti) {
					send('tti', 'value', 0, tti);
					ttiPerfObserver.disconnect();
				} else {
					// Не было logntask, поэтому делаем паузу и если их опять не будет,
					// то считает, что приложение уже готово на момент DOMReady!
					tti = now();
					setTimeout(check, 500);
				}
			}

			check();
		}

		// Events
		once(firstWinEvents, handleClick);
	});
}

function once(events: string[], fn: (eventType: string, evt: Event) => void, ctx?: Document | Window) {
	events.forEach(type => {
		const handle = (evt: Event) => {
			nativeGlobalThis.removeEventListener(type, handle, true);
			fn(type, evt);
		};

		(ctx = ctx || nativeGlobalThis).addEventListener(type, handle, true);
	});
}
