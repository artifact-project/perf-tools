Paint Timings
-------------
- https://w3c.github.io/paint-timing/

---

![Paint](https://cdn-images-1.medium.com/max/1600/1*73IwrL_crOMlls4Ve7AHBg.png)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.paint.js */

perfKeeperExtPaint.paintTimings(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { paintTimings } from '@perf-tools/keeper/ext/paint';

paintTimings(system);
```