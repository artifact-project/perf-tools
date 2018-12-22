var timekeeper = (function (exports) {
	'use strict';

	var nil = null;
	var BOLD = 'font-weight: bold;';
	var globalThis = Function('return this')();
	var Date = globalThis.Date;
	var dateNow = Date.now || (function () { return new Date().getTime(); });
	var startOffset = dateNow();
	var nativeConsole = globalThis.console;
	var nativePerf = (globalThis.performance || {});
	var s_group = 'group';
	var s_groupCollapsed = 'groupCollapsed';
	var s_mark = 'mark';
	var s_measure = 'measure';
	var s_clearMarks = 'clearMarks';
	var s_clearMeasures = 'clearMeasures';
	// Polyfill
	nativePerf.now = nativePerf.now
	    || nativePerf.webkitNow
	    || nativePerf.mozNow
	    || nativePerf.msNow
	    || (function () { return (dateNow() - startOffset); });
	function color(ms) {
	    return 'color: #' + (ms < 2 ? 'ccc' :
	        ms < 5 ? '666' :
	            ms < 10 ? '333' :
	                ms < 30 ? 'f90' :
	                    ms < 60 ? 'f60' :
	                        'f00');
	}
	function create(options) {
	    var perf = options.perf || nativePerf;
	    var prefix = options.prefix || '';
	    var console = options.console || nativeConsole;
	    var maxEntries = options.maxEntries == nil ? 1e3 : options.maxEntries;
	    var warn = options.warn || console.warn && console.warn.bind(console);
	    var needPrint = options.print;
	    var disabled = options.disabled;
	    var listener = options.listener;
	    // Private
	    var perfSupported = !!(options.timeline
	        && perf[s_mark]
	        && perf[s_measure]
	        && perf[s_clearMarks]
	        && perf[s_clearMeasures]);
	    var entries = [];
	    var emitEntries = [];
	    var activeEntries = [];
	    var activeGroups = [];
	    var api;
	    var cid = 0;
	    var lock = false;
	    function disable(state) {
	        disabled = state;
	    }
	    function listen(fn) {
	        listener = fn;
	        var idx = emitEntries.length;
	        while (idx--) {
	            fn(emitEntries[idx]);
	        }
	        emitEntries.length = 0;
	    }
	    function emit(entry) {
	        if (listener) {
	            listener(entry);
	        }
	        else {
	            emitEntries.unshift(entry);
	            if (emitEntries.length > maxEntries) {
	                emitEntries.length = maxEntries;
	            }
	        }
	    }
	    function measure(entry) {
	        var id = entry.id;
	        var label = "" + prefix + entry.name;
	        perf[s_measure](label, id);
	        perf[s_clearMarks](id);
	        perf[s_clearMeasures](label);
	    }
	    function __print__(entries) {
	        var i = 0;
	        var total = 0;
	        var start;
	        var entry;
	        var duration;
	        var selfDuration;
	        var logMsg;
	        var nextEntries;
	        var nextLength;
	        for (; i < entries.length; i++) {
	            entry = entries[i];
	            if (entry.end !== nil && !entry.active) {
	                nextEntries = entry.entries;
	                nextLength = nextEntries ? nextEntries.length : 0;
	                start = entry.start;
	                duration = entry.end - start;
	                logMsg = "" + prefix + entry.name + ": %c" + duration.toFixed(3) + "ms";
	                if (nextLength < 1) {
	                    console.log(logMsg, "" + BOLD + color(duration));
	                    total += duration;
	                }
	                else {
	                    console[console[s_groupCollapsed] && nextLength < 2
	                        ? s_groupCollapsed
	                        : s_group](logMsg, color(duration));
	                    selfDuration = duration - __print__(nextEntries);
	                    if (selfDuration > 3) {
	                        emit(createEntry('[[unknown]]', entry, false, start, start + selfDuration));
	                        console.log(prefix + "[[unknown]]: %c" + selfDuration.toFixed(3) + "ms", "" + BOLD + color(selfDuration));
	                    }
	                    total += duration;
	                    console.groupEnd();
	                }
	                if (entry.parent === nil) {
	                    entries.splice(i, 1);
	                    i--;
	                }
	            }
	        }
	        lock = false;
	        return total;
	    }
	    function printDefered() {
	        __print__(entries);
	    }
	    function print(state) {
	        if (state != nil) {
	            needPrint = state;
	        }
	        else if (lock === false) {
	            lock = true;
	            (globalThis.requestAnimationFrame || setTimeout)(printDefered);
	        }
	    }
	    function createEntry(name, parent, isGroup, start, end, isolate) {
	        var label = "" + prefix + name + "-" + ++cid;
	        var id = label + "-mark";
	        if (parent === api) {
	            parent = activeGroups[0] || nil;
	        }
	        var entry = {
	            id: id,
	            name: name,
	            parent: parent,
	            entries: isGroup ? [] : nil,
	            active: +isGroup,
	            start: start != nil ? start : perf.now(),
	            end: end != nil ? end : nil,
	            stop: isGroup ? stopGroup : stopEntry,
	        };
	        if (parent === nil) {
	            !disabled && entries.push(entry);
	        }
	        else if (parent.end !== nil && end == nil) {
	            warn("[timekeeper] Group \"" + parent.name + "\" is stopped");
	        }
	        else if (!disabled) {
	            parent.active++;
	            parent.entries.push(entry);
	        }
	        if (isGroup) {
	            entry.add = add;
	            entry.time = time;
	            entry.group = group;
	            entry.mark = groupMark;
	            !disabled && !isolate && activeGroups.unshift(entry);
	        }
	        else {
	            !disabled && activeEntries.push(entry);
	        }
	        !disabled && (start == nil) && perfSupported && perf[s_mark](id);
	        return entry;
	    }
	    function stopEntry(end) {
	        if (this.end === nil) {
	            this.end = end >= 0 ? end : perf.now();
	            (end == nil) && perfSupported && measure(this);
	            emit(this);
	            closeGroup(this.parent, end);
	        }
	        return this;
	    }
	    function stopGroup(end) {
	        groupStopAll(this);
	        closeGroup(this, end);
	        return this;
	    }
	    function closeGroup(entry, end) {
	        needPrint && print();
	        if (entry !== nil) {
	            if (entry.active > 0) {
	                (--entry.active === 0) && closeGroup(entry, end);
	            }
	            else if (entry.end === nil) {
	                var idx = activeGroups.indexOf(entry);
	                (idx > -1) && activeGroups.splice(idx, 1);
	                entry.end = end >= 0 ? end : perf.now();
	                (end == nil) && perfSupported && measure(entry);
	                emit(this);
	                closeGroup(entry.parent, end);
	            }
	        }
	    }
	    function add(name, start, end) {
	        if (start >= 0 && start <= end) {
	            createEntry(name, this, false, start).stop(end);
	        }
	    }
	    function time(name) {
	        return createEntry(name, this, false);
	    }
	    function timeEnd(name) {
	        if (!disabled) {
	            var idx = activeEntries.length;
	            var entry = void 0;
	            while (idx--) {
	                entry = activeEntries[idx];
	                if (entry.name === name) {
	                    entry.stop();
	                    activeEntries.splice(idx, 1);
	                    return;
	                }
	            }
	            warn && warn("[timekeeper] Timer \"" + name + "\" doesn't exist");
	        }
	    }
	    function groupStopAll(group) {
	        var entries = group.entries;
	        var idx = entries.length;
	        while (idx--) {
	            entries[idx].stop();
	        }
	    }
	    function groupMark(name) {
	        groupStopAll(this);
	        this.time(name);
	    }
	    function group(name, start, isolate) {
	        if (start === true) {
	            isolate = start;
	            start = nil;
	        }
	        return createEntry(name, isolate ? nil : this, true, start, nil, isolate);
	    }
	    function groupEnd(name, end) {
	        for (var i = 0; i < activeGroups.length; i++) {
	            if (name == nil || activeGroups[i].name === name) {
	                activeGroups[i].stop(end);
	                return;
	            }
	        }
	        warn("[timekeeper] Group \"" + name + "\" not found");
	    }
	    // Public API
	    return (api = {
	        entries: entries,
	        print: print,
	        disable: disable,
	        listen: listen,
	        add: add,
	        time: time,
	        timeEnd: timeEnd,
	        group: group,
	        groupEnd: groupEnd,
	    });
	}
	var system = globalThis.timekeeper ? globalThis.timekeeper.system : create({
	    print: /^(file:|https?:\/\/localhost)/.test(globalThis.location + ''),
	    timeline: true,
	    prefix: '⚡️',
	});

	exports.color = color;
	exports.create = create;
	exports.system = system;

	return exports;

}({}));
