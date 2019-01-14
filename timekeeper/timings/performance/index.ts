import { TimeKeeper } from '../../src/timekeeper/timekeeper';
import { sendTimingsFactory, domReady, globalThis } from '../utils';

export type PerformanceOptions = {
	minLatency: number;
	ttiDelay: number;
}

const defaultOptions: PerformanceOptions = {
	minLatency: 100,
	ttiDelay: 3000,
};

export function performanceTimings(keeper: TimeKeeper, options: PerformanceOptions = defaultOptions) {
	const sendTimings = sendTimingsFactory('tk-performance', keeper);
	const now = () => keeper.perf.now();
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

	function send(groupName: string, label: string,  start: number = 0, end: number = now()) {
		sendTimings(groupName, start, end, [
			[label, start, end],
		])
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
				send(`latency-${eventType}`, 'value', start, end);
			}
		}

		globalThis.addEventListener(eventType, () => {
			start = now();
			requestAnimationFrame(calc);
		}, true);
	});

	// TTI
	let ttiLastEntry: PerformanceEntry;
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

function once(events: string[], fn: (eventType: string) => void, ctx?: Document | Window) {
	events.forEach(name => {
		const handle = () => {
			globalThis.removeEventListener(name, handle, true);
			fn(name);
		};

		(ctx = ctx || globalThis).addEventListener(name, handle, true);
	});
}