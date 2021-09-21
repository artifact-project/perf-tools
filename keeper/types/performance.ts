import type { UserAgentSpecificTypes } from './userAgent';

export interface Performance {
	hardwareConcurrency?: number;
	memory?: PerformanceMemoryInformation;
	measureMemory?: () => Promise<PerformanceMeasureMemoryInformation>;
}

export interface PerformanceMemoryInformation {
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
	usedJSHeapSize: number;
}

export interface PerformanceMeasureMemoryInformation {
	breakdown: PerformanceMeasureMemoryBreakdown[];
	bytes: number;
}

export interface PerformanceMeasureMemoryBreakdown {
	attribution: string[];
	bytes: number;
	userAgentSpecificTypes: UserAgentSpecificTypes[];
}
