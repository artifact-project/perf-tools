FPS Meter
---------
- http://wicg.github.io/frame-timing/
- https://developer.mozilla.org/en-US/docs/Web/API/Window/mozPaintCount

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.fps.js */

perfKeeperExtFps.fpsMeter(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { fpsMeter } from '@perf-tools/keeper/ext/fps';

fpsMeter(system);
```