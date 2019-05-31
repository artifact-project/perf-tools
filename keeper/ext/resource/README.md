Resources
---------
- https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API

---

Start|15sec|1min
---|---|---
![Start](https://cdn-images-1.medium.com/max/1600/1*GOQYCUHVU8fhu0cQv3JzDw.png)|
![15sec](https://cdn-images-1.medium.com/max/1600/1*B3YrsKIqAhVl9J2E83qN4g.png)|
![1min](https://cdn-images-1.medium.com/max/1600/1*flmBRrsX2q0a1fc7IgY0zg.png)

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
		['1min', 1 * 60 * 1000],
		['2min', 2 * 60 * 1000],
		['3min', 3 * 60 * 1000],
	],
});

// more complex examples with `resourceName`
resourceStats(system, {
	resourceName: ({ name }) => {
		const result = [];

		// can be multidimensional array
		if (/unpkg\.com/.test(name)) {
			result.push(['cdn', 'unpkg']);
			/min\.js($|\?)/.test(name) && result.push(['js', 'min']);
		}

		return result;
	},
});
```
