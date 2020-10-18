import { connection, navigator, performance } from '../../util';
import { NestedMetrics, send } from '../../util/system';

// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
const deviceMemory = navigator.deviceMemory;

// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
const hardwareConcurrency = performance.hardwareConcurrency;

const isHighEnd = hardwareConcurrency! > 4 || deviceMemory! > 4;
const isLowEnd = hardwareConcurrency! <= 4 || deviceMemory! <= 4;
const deviceType = (
	isHighEnd
	? 'high'
	: isLowEnd
	? 'low'
	: 'unk'
);
const experienceType = (isLowEnd || connection && (
	['slow-2g', '2g', '3g'].indexOf(connection.effectiveType) > -1
	|| connection.saveData
)) ? 'low' : 'high';

const nested: NestedMetrics = {
	[`type_${deviceType}`]: [0, 1],
	[`exp_${experienceType}`]: [0, 1],
};

deviceMemory && (nested.memory = [0, deviceMemory]);
hardwareConcurrency && (nested.hardware_concurrency = [0, hardwareConcurrency]);

send('pk-device', 0, 1, nested, 'raw');
