
interface Performance {
	hardwareConcurrency?: number;
	memory?: PerformanceMemoryInformation;
	measureMemory?: () => Promise<PerformanceMeasureMemoryInformation>;
}

interface PerformanceMemoryInformation {
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
	usedJSHeapSize: number;
}

interface PerformanceMeasureMemoryInformation {
	breakdown: PerformanceMeasureMemoryBreakdown[];
	bytes: number;
}

interface PerformanceMeasureMemoryBreakdown {
	attribution: string[];
	bytes: number;
	userAgentSpecificTypes: UserAgentSpecificTypes[];
}
