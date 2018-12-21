interface EntryProps {
	name: string;
	entryType: 'mark' | 'measure';
	startTime: number;
	duration: number;
}

class Entry implements EntryProps {
	name = this.props.name;
	entryType = this.props.entryType;
	startTime = this.props.startTime;
	duration = this.props.duration;

	constructor(private props: EntryProps) {
	}

	toJSON() {
		return this.props;
	}
}

type VendorPerf = Performance & {
	webkitNow(): number;
	mozNow(): number;
	msNow(): number;

	webkitMark(name: string): void;
	webkitMeasure(name: string, startMark: string, endMark: string): void;

	webkitGetEntries(filter?: Pick<Entry, 'name' | 'entryType'>): Entry[];
	webkitGetEntriesByType(type: Entry['entryType']): Entry[];
	webkitGetEntriesByName(name: string): Entry[];

	webkitClearMarks(name: string): void;
	webkitClearMeasures(name: string): void;
}

type PerformanceAPI = Pick<Performance,
	'now'
	| 'mark'
	| 'measure'
	| 'clearMarks'
	| 'clearMeasures'
	| 'clearResourceTimings'
> & {
	getEntries(filter?: Pick<Entry, 'name' | 'entryType'>): Entry[];
	getEntriesByType(type: Entry['entryType']): Entry[];
	getEntriesByName(name: string): Entry[];
};

const dateNow = Date.now || function () {
	return new Date().getTime();
}

const startOffset = dateNow();
const Exception = typeof DOMException !== 'undefined' ? DOMException : Error;


export function polyfill<T extends object>(global: T) {
	const performance = (global['performance'] || {}) as PerformanceAPI;

	const _entries: Entry[] = [];
	const _marksIndex: {[name:string]: Entry} = {};

	function _filterEntries<K extends keyof Entry>(key: K, value: Entry[K]) {
		const n = _entries.length;
		const result = [];
		let i = 0;

		for (; i < n; i++) {
			if (_entries[i][key] == value) {
				result.push(_entries[i]);
			}
		}

		return	result;
	}

	function _clearEntries(type: Entry['entryType'], name: string) {
		let i = _entries.length;

		while (i--) {
			const entry = _entries[i];

			if (entry.entryType == type && (name === void 0 || entry.name == name)) {
				_entries.splice(i, 1);
			}
		}
	}

	function isNotSupport(perf: object, method: keyof Performance): perf is VendorPerf {
		return !perf[method];
	}

	if (isNotSupport(performance, 'now')) {
		performance.now = performance.webkitNow || performance.mozNow || performance.msNow || function now() {
			return dateNow() - startOffset;
		};
	}

	if (isNotSupport(performance, 'mark')) {
		performance.mark = performance.webkitMark || function mark(name){
			const mark = new Entry({
				name: name,
				entryType: 'mark',
				startTime: performance.now(),
				duration: 0,
			});

			_entries.push(mark);
			_marksIndex[name] = mark;
		};
	}

	if (isNotSupport(performance, 'measure')) {
		performance.measure = performance.webkitMeasure || function measure(name, startMark, endMark) {
			let errMark: string;

			if (!_marksIndex.hasOwnProperty(startMark)) {
				errMark = startMark;
			} else if (!_marksIndex.hasOwnProperty(endMark)) {
				errMark = endMark;
			}

			if (errMark) {
				throw new Exception(`Failed to execute 'measure' on 'Performance': The mark '${errMark}' does not exist.`);
			}

			const start = _marksIndex[startMark].startTime;
			const end = _marksIndex[endMark].startTime;

			_entries.push(new Entry({
				name,
				entryType: 'measure',
				startTime: start,
				duration: end - start,
			}));
		};
	}

	if (isNotSupport(performance, 'getEntries')) {
		performance.getEntries = performance.webkitGetEntries || function getEntries(filter?: Pick<Entry, 'name' | 'entryType'>) {
			if (filter != null) {
				return _entries.filter((entry) => entry.name === filter.name && entry.entryType === filter.entryType);
			}
			return _entries;
		};
	}

	if (isNotSupport(performance, 'getEntriesByType')) {
		performance.getEntriesByType = performance.webkitGetEntriesByType || function getEntriesByType(type: Entry['entryType']) {
			return _filterEntries('entryType', type);
		};
	}

	if (isNotSupport(performance, 'getEntriesByName')) {
		performance.getEntriesByName = performance.webkitGetEntriesByName || function getEntriesByName(name) {
			return _filterEntries('name', name);
		};
	}

	if (isNotSupport(performance, 'clearMarks')) {
		performance.clearMarks = performance.webkitClearMarks || function clearMarks(name){
			_clearEntries('mark', name);
			delete _marksIndex[name];
		};
	}

	if (isNotSupport(performance, 'clearMeasures')) {
		performance.clearMeasures = performance.webkitClearMeasures || function clearMeasures(name){
			_clearEntries('measure', name);
		};
	}

	if (isNotSupport(performance, 'clearResourceTimings')) {
		performance.clearResourceTimings = function clearResourceTimings() {};
	}

	try {
		if (!global['performance']) {
			// Polyfilling
			global['performance'] = performance;
		}
	} catch (_) {}

	return global as T & {
		performance: PerformanceAPI;
	};
}

const globalThis = polyfill(new Function('return this'));

if (typeof self !== 'undefined' && (self as any) !== globalThis) {
	polyfill(self);
}

export const performance = globalThis.performance;
export const now = function () {
	return performance.now();
};