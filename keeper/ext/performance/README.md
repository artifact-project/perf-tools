Performance Timings
-------------------
- Time to Interactive (TTI)
- Time to First click/touch and other events
- Tab Unload
- Latency

---

First Event|Latency|TTI
---|---|---
![First Event](https://cdn-images-1.medium.com/max/2400/1*Ma8s5-HtSPe_xMrMam3bDg.png)|
![Latency](https://cdn-images-1.medium.com/max/2600/1*5o4-B9ZIJcPwcXViXUdygw.png)|
![TTI](https://cdn-images-1.medium.com/max/2000/1*oD3LbhOO6YKrTNkKLBt_CQ.png)

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