import { OBJECT_TYPE } from './isType';

const nativeGlobalThis = (0
	|| typeof globalThis === OBJECT_TYPE && globalThis 
	|| typeof window === OBJECT_TYPE && window
	|| {}
) as typeof globalThis;

export const console = nativeGlobalThis.console;
export const document = nativeGlobalThis.document;
export const location = nativeGlobalThis.location;
export const navigator = nativeGlobalThis.navigator;
export const performance = nativeGlobalThis.performance;

export const setTimeout = nativeGlobalThis.setTimeout;
export const addEventListener = nativeGlobalThis.addEventListener;
export const noop = () => {};
export const perfNow = () => performance.now();
