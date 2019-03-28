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

perfKeeperExtResource.resourceStats(perfKeeper.system);
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
	beforeEntryAdd: (entry) => {
		const { duration, initiatorType, name } = entry;

		if (initiatorType === 'fetch') {
			sendSomeStatFromMyFetch([name, duration]);
		}

		// return falsy result to remove this resource from global stats
		return true
	},

	resourceName: (entry) => /\.cdn\./.test(entry.name) ? ['cdn'] : null,

	// by default: `15sec`, `1min`, `5min`, `15min`, `30min`, `1hour`, `1day` and `2days`
	intervals: [
		['1min', 60 * 1000],
		['2min', 60 * 1000],
		['3min', 60 * 1000],
	],
});

// more complex examples with `resourceName`
resourceStats(system, {
	resourceName: (entry) => {
		const { name } = entry

		let result = []

		// can be multidimensional array
		if (/unpkg\.com/.test(name)) {
			result.push(['cdn', 'unpkg'])

			if (/min\.js$/.test(name) {
				result.push(['js','min'])
			}
		} else {
			result = null
		}

		return result
	}
});
```
