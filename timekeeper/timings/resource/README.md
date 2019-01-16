Resources
---------
Yes, these are not time metric, but this is as very important metric what must be monitored.
In addition, this metric will be divided into time intervals, so let it be.

- Page size (bytes)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/timekeeper.js */
/* Paste code from ./dist/timekeeper.timings.resource.js */

timekeeperTimingsResource.resourceTimings(timekeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { resourceTimings } from '@perf-tools/timekeeper/timings/resource';

resourceTimings(system);

// or with options
resourceTimings(system, {
	// by default `undefined`
	groupName: (entry) => /\.cdn\./.test(name) ? 'cdn' : null,

	// by default: `1min`, `5min`, `15min`, `30min`, `1hour`, `1day` and `2days`
	intervals: [
		['1min', 60 * 1000],
		['2min', 60 * 1000],
		['3min', 60 * 1000],
	],
});
```