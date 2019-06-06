import { PerfKeeper } from '../../src/keeper/keeper';
import { createTimingsGroup, globalThis, now } from '../utils';
import { startMeasure, stopMeasure } from './meter';

export type LikeScrollEvent = {
	target: EventTarget | null;
}

export type FPSMeterOptions = {
	rate: number;
	scrollableName?: (scrollRef: HTMLElement | Document) => string | null | undefined;
	scrollableElement?: Window | HTMLElement | null;
}

export const defaultFPSMeterOptions: FPSMeterOptions = {
	rate: 300,
	scrollableName: (scrollRef: HTMLElement | Document) => scrollRef === document ? 'page' : null,
	scrollableElement: globalThis,
};

export function fpsMeter(keeper: PerfKeeper, options: FPSMeterOptions = defaultFPSMeterOptions) {
	const {
		rate,
		scrollableName,
		scrollableElement,
	} = options;

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
			setTimeout(endScroll, rate);
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
		const name = scrollableName ? scrollableName(element) : null;
		const [set, send] = createTimingsGroup(`pk-fps${name ? `-${name}` : ''}`, keeper, 'fps');
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

	function handleScroll({target}: LikeScrollEvent) {
		if (!interactive) {
			startScroll = now();
			interactive = true;
			startMeasure(onFPS, rate);
			requestAnimationFrame(calcLatency);
		} else if (element !== target) {
			sendStats();
			startScroll = now();
			requestAnimationFrame(calcLatency);
		}

		element = target as HTMLElement;
		scrollRev++;
		checkEndScroll();
	}

	scrollableElement && scrollableElement.addEventListener('scroll', handleScroll, true);

	return {
		handleScroll,
		destory() {
			scrollableElement && scrollableElement.removeEventListener('scroll', handleScroll, true);
		},
	};
}
