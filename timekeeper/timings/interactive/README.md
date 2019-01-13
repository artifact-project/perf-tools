System interactivity
--------------------
- Time to Interactive (TTI)
- Time to First click/touch and other events
- Tab Unload
- Latency

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./timekeeper.js */
/* Paste code from ./timekeeper.timings.interactive.js */

timekeeperTimingsInteractive.interactiveTimings(timekeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { navigationTimings } from '@perf-tools/timekeeper/timings/interactive';

interactiveTimings(system);

// or with options
interactiveTimings(system, {
	tapName: ({pathname}: Location) => (pathname === '/' ? 'index' : pathname).replace(/[\/\.]/g, '-'),
	minLatency: 100,
});
```