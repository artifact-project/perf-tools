import { addEventListener } from './global';

export function domReady(fn: () => void) {
	if (document.readyState === 'complete') {
		setTimeout(fn, 0);
	} else {
		addEventListener('pageshow', fn);
	}
}
