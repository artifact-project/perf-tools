import { OBJECT_TYPE } from './isType';

const nativeGlobalThis = (0
	|| typeof globalThis === OBJECT_TYPE && globalThis 
	|| typeof window === OBJECT_TYPE && window
	|| typeof global === OBJECT_TYPE && global 
	|| {}
) as typeof globalThis;

export const console = nativeGlobalThis.console;
export const document = nativeGlobalThis.document || {};
export const location = nativeGlobalThis.location || {};
export const navigator = nativeGlobalThis.navigator || {};
export const connection = navigator.connection;
export const performance = nativeGlobalThis.performance;

export const noop = () => {};
export const perfNow = () => performance.now();
export const setTimeout = nativeGlobalThis.setTimeout;
export const nextFrame = (nativeGlobalThis.requestAnimationFrame || setTimeout).bind(nativeGlobalThis);
export const addEventListener = nativeGlobalThis.addEventListener || noop;

