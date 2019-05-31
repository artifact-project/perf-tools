Navigation Timings
------------------
- https://i.stack.imgur.com/qBvJL.png
- https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API
- https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming

---

NET|DOM Ready|DOM Loaded
---|---|---
![NET](https://cdn-images-1.medium.com/max/400/1*BRI9tq9jWcyfNkuTnyL7zw.png)|![DOM Ready](https://cdn-images-1.medium.com/max/800/1*DXKXzb0MKPFoSXBqcrxUtQ.png)|![DOM Loaded](https://cdn-images-1.medium.com/max/2400/1*bA3cIbAWQBUdnkiwAY8hkA.png)

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