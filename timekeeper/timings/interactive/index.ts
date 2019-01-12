import { TimeKeeper } from '../../src/timekeeper/timekeeper';

export type Options = {
	tabName: (location: Location) => string;
	minLatency: number;
}

const globalThis = Function('return this')() as Window;
const document = globalThis.document;
const defaultOptions: Options = {
	tabName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname).replace(/[\/\.]/g, '-'),
	minLatency: 100,
};

export function interactiveTimings(keeper: TimeKeeper, options: Options = defaultOptions) {
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
		const group = keeper.group(`tk-interactive-${groupName}`, start, true);

		group.add(label, start, end);
		group.stop(end);
	}

	// Window
	once(firstWinEvents, (eventType) => {
		send(`first-${eventType}`, 'value');
	});

	// Tab unload
	once(['beforeunload'], () => {
		send(`tab-unload`, options.tabName(globalThis.location));
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
				send(`latency`, eventType, start, end);
			}
		}

		globalThis.addEventListener(eventType, () => {
			start = now();
			requestAnimationFrame(calc);
		}, true);
	})

	// After DOM Ready
	ready(() => {
		once(firstWinEvents, (eventType) => {
			send(`first-${eventType}`, 'after-ready');
		});
	});
}

function ready(fn: () => void) {
	if (document.readyState === 'complete') {
		fn();
	} else {
		once(['DOMContentLoaded'], fn, document);
	}
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