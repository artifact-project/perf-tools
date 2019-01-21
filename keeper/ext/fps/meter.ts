import { domReady, globalThis, now, document } from '../utils';

let helper: HTMLElement;
let helperStyle: HTMLElement['style'];
let values = [] as number[];
let startTime = 0;
let rafId = 0;
let paintCount = 0;
let enabled = false;
let rate = 300;
let handle: (fps: number) => void;

export function startMeasure(callback: typeof handle, r?: number) {
	handle = callback;
	r && (rate = r);
	enabled = true;
	domReady(run);
}

export function stopMeasure() {
	if (enabled) {
		enabled = false;
		cancelAnimationFrame(rafId);
		helper && document.body.removeChild(helper);
	}
}

const ZERO_PX = '0px';

function measure() {
	values.length = 0;
	startTime = now();
	helperStyle.left = helperStyle.left === ZERO_PX ? `${window.innerWidth/2}px` : ZERO_PX;

	if (globalThis.mozPaintCount != null) {
		paintCount = globalThis.mozPaintCount;
	} else {
		saveValue();
	}
}

function saveValue() {
	const val = +globalThis.getComputedStyle(helper, null).left.slice(0, -2);
	val && values.push(val);
	rafId = requestAnimationFrame(saveValue);
}

function onTransitionEnd() {
	const duration = now() - startTime;
	let frames = 0;

	if (globalThis.mozPaintCount != null) {
		frames = globalThis.mozPaintCount - paintCount;
	} else {
		cancelAnimationFrame(rafId);

		let duplicates = 0;
		let current = -1;

		for (let i = 0; i < values.length; i++) {
			const val = values[i];

			if (val == current) {
				duplicates++;
			} else {
				current = val;
			}
		}

		frames = values.length - duplicates;
	}

	if (enabled) {
		handle(Math.min(Math.round(frames * 1000 / duration), 60));
		measure();
	}
}

function init() {
	if (!helper) {
		helper = document.createElement('div');
		helper.id = 'FPSMeterHelper';
		helperStyle = helper.style;

		helperStyle.position = 'absolute';
		helperStyle.backgroundColor = 'transparent';
		helperStyle.width = '1px';
		helperStyle.height = '1px';
		helperStyle.left = ZERO_PX;
		helperStyle.bottom = ZERO_PX;
		helperStyle.transition = `left ${rate}ms linear`;

		helper.addEventListener('transitionend', onTransitionEnd, false);
	}
}

function run() {
	if (enabled) {
		init();
		document.body.appendChild(helper);
		setTimeout(measure, 0);
	}
}

domReady(init);