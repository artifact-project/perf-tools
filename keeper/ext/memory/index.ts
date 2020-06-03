export * from './memoryStats';
export * from './measureMemory';

import { PerfKeeper } from '../../src/keeper/keeper';
import { memoryStats } from './memoryStats';
import { measureMemory } from './measureMemory';

export function memory(keeper: PerfKeeper) {
	memoryStats(keeper, {
		groupName: 'pk-memory-stats',
	});
	measureMemory(keeper, {
		groupName: 'pk-memory-measure',
	});
}
