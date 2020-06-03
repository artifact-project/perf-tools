import { PerfKeeper } from '../../src/keeper/keeper';
import { createTimingsGroup } from '../utils';

export type NetworkInformationOptions = {
	sendChanged?: boolean;
}

export function networkInformation(keeper: PerfKeeper, options: NetworkInformationOptions = {}) {
	const {sendChanged = true} = options;
	const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
	const [set, send] = createTimingsGroup('pk-conn', keeper, 'none', false);

	set(['supported', `${!!connection}`], 0, 1, 'none');

	if (!connection) {
		send(null, 0, 1);
		return;
	}

	const keys: (keyof NetworkInformation)[] = [
		'downlink',
		// 'downlinkMax',
		'effectiveType',
		'rtt',
		'saveData',
		'type',
	];
	const prevInfo = {} as NetworkInformation;
	const setValue = <K extends keyof NetworkInformation>(key: K) => {
		const val = connection[key];
		const prev = prevInfo[key];

		if (prevInfo[key] !== val) {
			prevInfo[key] = val;

			if (key === 'effectiveType' || key === 'type' || key === 'saveData') {
				set([key, val as string], 0, 1)
				if (sendChanged && prev !== undefined) {
					set(['changed', key, prev as string, val as string], 0, 1);
				}

			} else {
				set([key], 0, val as number, 'raw');
			}

			return true;
		}
	};

	// Initial metricts
	keys.forEach(setValue);
	send(null, 0, 1, true);

	if (sendChanged) {
		connection.addEventListener('change', () => {
			let changes = false;
			keys.forEach((key) => {
				changes = setValue(key) || changes;
			});
			changes && send(null, 0, 1, true);
		});
	}
}
