Memory
------
- **measureMemory**
  - 🔬https://www.chromestatus.com/feature/5685965186138112
  - https://github.com/WICG/performance-measure-memory
- **memory**
  - https://webplatform.github.io/docs/apis/timing/properties/memory/

---

Start | 15sec | 1min
---|---|---
![Start](https://habrastorage.org/webt/4n/dm/s6/4ndms6ru3t56unt5bread7fzuf0.png)|![15sec](https://habrastorage.org/webt/ev/h0/fj/evh0fjpoqeadv5p4yn8r4kyyui0.png)|![1min](https://habrastorage.org/webt/jq/if/mh/jqifmhh5pz9yukce1fduq0j4ivu.png)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.memory.js */

/** @desc Experimental */
perfKeeperExtMemory.measureMemory(perfKeeper.system, {
	groupName: 'pk-memory-measure', // default: 'pk-memory'
});

/** @desc Only Chrome */
perfKeeperExtMemory.memoryStats(perfKeeper.system, {
	groupName: 'pk-memory-stats', // default: 'pk-memory'
});
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
