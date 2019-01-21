Navigation Timings
------------------
- https://i.stack.imgur.com/qBvJL.png
- https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API
- https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/ext/navigation-timings.js */

perfKeeperExtNavigation.navigationTimings(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { navigationTimings } from '@perf-tools/keeper/ext/navigation';

navigationTimings(system);
```