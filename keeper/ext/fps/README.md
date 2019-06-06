FPS Meter
---------
- http://wicg.github.io/frame-timing/
- https://developer.mozilla.org/en-US/docs/Web/API/Window/mozPaintCount

---

First scroll|Next scroll
---|---
![first](https://cdn-images-1.medium.com/max/2000/1*XJF70Vw0ndIQHhDOaHKUxQ.png)|![next](https://cdn-images-1.medium.com/max/1600/1*lkTMa7nCFnG1x8fjS1lv-A.png)

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

---

#### Manual manipulation

```ts
import { system } from '@perf-tools/keeper';
import { fpsMeter } from '@perf-tools/keeper/ext/fps';

const meter = fpsMeter(system, {
	scrollableName: (el: HTMLElement) => el ? el.dataset.scrollName : null,
	scrollableElement: null,
});

// Where in the code we call the scroll handling method and pass the element that we scroll.
meter.handleEvent({
	target: myScroll.containerElement,
});

// Ending
meter.destory();
```