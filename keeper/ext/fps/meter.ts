import { domReady, nativeGlobalThis, now, document } from '../utils';

let helper: HTMLElement;
let helperStyle: HTMLElement['style'];
let startTime = 0;
let rafId = 0;
let startPaintCount: number;
let paintCount: number;
let prevHelperLeft: number;
let enabled = false;
let attached = false;
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
		attached && document.body.removeChild(helper);
		attached = false;
	}
}

const ZERO_PX = '0px';

function measure() {
	startTime = now();
	startPaintCount = nativeGlobalThis.mozPaintCount || 0;
	paintCount = 0;
	prevHelperLeft = -1;
	helperStyle.left = helperStyle.left === ZERO_PX ? `${window.innerWidth/2}px` : ZERO_PX;

	saveValue();
}

function saveValue() {
	const style = nativeGlobalThis.getComputedStyle(helper, null);
	const left = style && style.left ? +style.left.slice(0, -2) : 0;

	if (prevHelperLeft !== left) {
		paintCount++;
		prevHelperLeft = left;
	}

	rafId = requestAnimationFrame(saveValue);
}

function onTransitionEnd() {
	const duration = now() - startTime;
	const frames = (nativeGlobalThis.mozPaintCount || paintCount) - startPaintCount;

	cancelAnimationFrame(rafId);

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
		attached = true;
		document.body.appendChild(helper);
		setTimeout(measure, 0);
	}
}

domReady(init);
