Paint Timing
------------
- https://w3c.github.io/paint-timing/

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/timekeeper.js */
/* Paste code from ./dist/timekeeper.timings.paint.js */

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