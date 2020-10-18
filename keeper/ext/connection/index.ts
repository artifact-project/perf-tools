import { connection } from '../../util/global';
import { send } from '../../util/system';

const conn = connection!;
const check = () => {
	send('pk-conn', 0, 1, {
		downlink: [0, conn.downlink],
		downlinkMax: [0, conn.downlinkMax],
		rtt: [0, conn.rtt],
		// [`type_${conn!.type}`]: [0, 1],
		[`save_data_${conn.saveData}`]: [0, 1],
		[`effective_type_${conn.effectiveType || 'unk'}`]: [0, 1],
	}, 'raw');
};

if (conn) {
	check();
	conn.addEventListener('change', check);
} else {
	send('pk-conn', 0, 1, {effective_type_unk: [0, 1]}, 'raw');
}
