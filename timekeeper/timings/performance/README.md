Performance Timings
-------------------
- Time to Interactive (TTI)
- Time to First click/touch and other events
- Tab Unload
- Latency

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/timekeeper.js */
/* Paste code from ./dist/timekeeper.timings.performance.js */

timekeeperTimingsPerformance.performanceTimings(timekeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { performanceTimings } from '@perf-tools/timekeeper/timings/performance';

performanceTimings(system);

// or with options
performanceTimings(system, {
	minLatency: 150, // by default `100`
	ttiDelay: 2500, // by default `3000`
});
```