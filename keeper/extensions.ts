import { PerfKeeper } from './src/keeper/keeper';

import { fpsMeter, defaultFPSMeterOptions, FPSMeterOptions } from './ext/fps';
import { networkInformation, NetworkInformationOptions } from './ext/connection';
import { navigationTimings, defaultNavTimingsOptions, NavTimingsOptions } from './ext/navigation';
import { paintTimings, defaultPaintTimingsOptions, PaintTimingsOptions } from './ext/paint';
import { performanceTimings, defaultPerformanceOptions, PerformanceOptions } from './ext/performance';
import { resourceStats, defaultResourceStatsOptions, ResourceStatsOptions } from './ext/resource';
import { memoryStats, MemoryStatsOptions } from './ext/memory';

export type Extensions = Partial<{
	fps: FPSMeterOptions;
	navigation: NavTimingsOptions;
	networkInformation: NetworkInformationOptions;
	paint: PaintTimingsOptions;
	performance: PerformanceOptions;
	resource: ResourceStatsOptions;
	memory: MemoryStatsOptions;
}>

export function set(keeper: PerfKeeper, options: Extensions) {
	function apply<O extends object>(
		ext: (keeper: PerfKeeper, options?: O) => void,
		options?: O,
		defaults?: O,
	) {
		ext(keeper, {
			...Object(defaults),
			...Object(options),
		});
	}

	apply(networkInformation, options.networkInformation);
	apply(fpsMeter, options.fps, defaultFPSMeterOptions);
	apply(navigationTimings, options.navigation, defaultNavTimingsOptions);
	apply(paintTimings, options.paint, defaultPaintTimingsOptions);
	apply(performanceTimings, options.performance, defaultPerformanceOptions);
	apply(resourceStats, options.resource, defaultResourceStatsOptions);
	apply(memoryStats, options.memory, {});
}