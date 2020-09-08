import { document, addEventListener, noop } from './global';

const HIDDEN = 'hidden';
const visibilityState = 'visibilityState';

let inited = false;
let unloaded = false;
let firstTimeStamp = -1;

export const hidden = (handler: (ts: number, unloaded: boolean) => void, once?: boolean) => {
	if (!inited) {
		inited = true;
		
		addEventListener('pagehide', (evt: PageTransitionEvent) => {
			unloaded = !evt.persisted;
		});
		
		// https://bugs.chromium.org/p/chromium/issues/detail?id=987409
		addEventListener('beforeunload', noop);
	}

	addEventListener('visibilitychange', (evt) => {
		(document[visibilityState] === HIDDEN) && handler(evt.timeStamp, unloaded);
	}, {
		capture: true,
		once: !!once,
	});
}

if (document) {
	firstTimeStamp = document[visibilityState] === HIDDEN ? 0 : Infinity;

	hidden((ts) => {
		firstTimeStamp = ts;
	}, true);
}

export const firstHidden = () => firstTimeStamp;
