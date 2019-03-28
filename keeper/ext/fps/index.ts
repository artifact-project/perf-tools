import { PerfKeeper } from '../../src/keeper/keeper';
import { createTamingsGroup, globalThis, now } from '../utils';
import { startMeasure, stopMeasure } from './meter';

export type FPSMeterOptions = {
	rate: number;
	scrollableName?: (scrollRef: HTMLElement | Document) => string | null | undefined;
}

export const defaultFPSMeterOptions: FPSMeterOptions = {
	rate: 300,
	scrollableName: (scrollRef: HTMLElement | Document) => scrollRef === document ? 'page' : null,
};

export function fpsMeter(keeper: PerfKeeper, options: FPSMeterOptions = defaultFPSMeterOptions) {
	let element: HTMLElement;
	let interactive = false;
	let scrollRev = 0;
	let checkScrollRev = 0;
	let checkEndLock = false;
	let fpsHistory = [] as number[];
	let startScroll = 0;
	let latency = 0;

	function onFPS(fps: number) {
		fpsHistory.push(fps);
	}

	function checkEndScroll() {
		if (!checkEndLock) {
			checkEndLock = true;
			checkScrollRev = scrollRev;
			setTimeout(endScroll, options.rate);
		}
	}

	function endScroll() {
		checkEndLock = false;

		if (checkScrollRev === scrollRev) {
			interactive = false;
			stopMeasure();
			sendStats();
		} else {
			checkEndScroll();
		}
	}

	function sendStats() {
		const name = options.scrollableName ? options.scrollableName(element) : null;
		const [set, send] = createTamingsGroup(`pk-fps${name ? `-${name}` : ''}`, keeper, 'fps');
		const length = fpsHistory.length;
		const middle = Math.floor(length / 2)
		let avg = 0;
		let min = 60;
		let max = 0;

		fpsHistory = fpsHistory.sort();

		fpsHistory.forEach((val) => {
			min = Math.min(min, val);
			max = Math.max(max, val);
			avg += val;
		});

		if (length > 0) {
			avg /= length;

			set('latency', 0, latency, 'ms');
			set('min', 0, min);
			set('max', 0, max);
			set('avg', 0, avg);
			set('median', 0, length % 2
				? fpsHistory[middle]
				: (fpsHistory[middle - 1] + fpsHistory[middle]) / 2
			);
			send(null, 0, avg);

			fpsHistory.length = 0;
		}
	}

	function calcLatency() {
		latency = now() - startScroll;
	}

	globalThis.addEventListener('scroll', ({target}) => {
		if (!interactive) {
			startScroll = now();
			interactive = true;
			startMeasure(onFPS, options.rate);
			requestAnimationFrame(calcLatency);
		} else if (element !== target) {
			sendStats();
			startScroll = now();
			requestAnimationFrame(calcLatency);
		}

		element = target as HTMLElement;
		scrollRev++;
		checkEndScroll();
	}, true);
}
