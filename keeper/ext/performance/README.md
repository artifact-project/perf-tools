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
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.performance.js */

perfKeperExtPerformance.performanceTimings(perfKeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { performanceTimings } from '@perf-tools/keeper/ext/performance';

performanceTimings(system);

// or with options
performanceTimings(system, {
	minLatency: 150, // default: 100ms
	ttiDelay: 2500,  //          2000ms
	perfIdProp: 'data-id', //    'data-pref-id'
	getPerfId: (target: HTMLElement, perfIdProp: string) => {
		// ...
		return id;
	},
});
```