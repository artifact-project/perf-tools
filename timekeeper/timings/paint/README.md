Paint Timing
------------
- https://w3c.github.io/paint-timing/

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./timekeeper.js */
/* Paste code from ./timekeeper.timings.paint.js */

timekeeperTimingsPaint.paintTimings(timekeeper.system);
</script>
```

---

#### As Module
```ts
import { system } from '@perf-tools/timekeeper';
import { paintTimings } from '@perf-tools/timekeeper/timings/paint';

paintTimings(system);
```