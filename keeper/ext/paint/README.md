Paint Timings
-------------
- https://w3c.github.io/paint-timing/

---

![Paint](https://cdn-images-1.medium.com/max/1600/1*73IwrL_crOMlls4Ve7AHBg.png)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.paint.js */

perfKeeperExtPaint.paintTimings(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { paintTimings } from '@perf-tools/keeper/ext/paint';

paintTimings(system);

// With options
paintTimings(system, {
	filter: (duration: number, entry: PaintTimingsOptions) => {
		if (duration === 0) {                  // 0ms
			return false;  // skip metric
		} else if (duration < 30 * 1000) {     // < 30sec
			return true; // normal metric value
		} else if (duration < 5 * 60 * 1000) { // < 5min
			return `${entry.name}_slow`; // new metric name
		} else {                               // > 5min
			return `${entry.name}_terribly`;
		}
	},
});
```
