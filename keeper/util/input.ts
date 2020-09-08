import { addEventListener } from './global';

let promise: Promise<unknown>;

export const firstInput = (callback: () => void) => {
	try {
		if (!promise) {
			promise = new Promise((resolve) => {
				['keydown', 'mousedown', 'scroll', 'mousewheel', 'touchstart', 'pointerdown'].map((type) => {
					addEventListener(type, resolve, {
						once: true,
						passive: true,
						capture: true,
					});
				});
			});
		}

		promise.then(callback);
	} catch {}
}
