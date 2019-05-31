Memory
------
- https://webplatform.github.io/docs/apis/timing/properties/memory/

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.memory.js */

perfKeeperExtMemory.memoryStats(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { memoryStats } from '@perf-tools/keeper/ext/memory';

memoryStats(system);

// or with options
memoryStats(system, {
	// by default: `15sec`, `1min`, `5min`, `15min`, `30min`, `1hour`, `1day` and `2days`
	intervals: [
		['1min', 1 * 60 * 1000],
		['2min', 2 * 60 * 1000],
		['3min', 3 * 60 * 1000],
	],
});
```
