Navigation Timings
------------------
- https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API
- https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./timekeeper.js */
/* Paste code from ./timekeeper.timings.navigation.js */

timekeeperTimingsNavigation.navigationTimings(timekeeper.system);
</script>
```

---

#### As Module
```ts
import { system } from '@perf-tools/timekeeper';
import { navigationTimings } from '@perf-tools/timekeeper/timings/navigation';

navigationTimings(system);
```