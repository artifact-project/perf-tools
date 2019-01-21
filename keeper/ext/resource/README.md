Resources
---------
- Page size (KiB)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.resource.js */

perfKeeperExtResource.resourceTimings(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { resourceStats } from '@perf-tools/keeper/ext/resource';

resourceStats(system);

// or with options
resourceStats(system, {
	resourceName: (entry) => /\.cdn\./.test(entry.name) ? ['cdn'] : null,
	resourceGroupName: (entry) => getGroupName(entry),

	// by default: `15sec`, `1min`, `5min`, `15min`, `30min`, `1hour`, `1day` and `2days`
	intervals: [
		['1min', 60 * 1000],
		['2min', 60 * 1000],
		['3min', 60 * 1000],
	],
});
```