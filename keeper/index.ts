import {system, send} from './util/system';
export * from './core/core';

import './ext/navigation';
import './ext/paint';
import './ext/performance';
import './ext/connection';

export {
	system,
	send as systemSend,
};
