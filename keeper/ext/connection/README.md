Navigator Connection
--------------------
- https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
- https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API

---

Start|15sec|1min
---|---|---
![Start](https://cdn-images-1.medium.com/max/1600/1*GOQYCUHVU8fhu0cQv3JzDw.png)|![15sec](https://cdn-images-1.medium.com/max/1600/1*B3YrsKIqAhVl9J2E83qN4g.png)|![1min](https://cdn-images-1.medium.com/max/1600/1*flmBRrsX2q0a1fc7IgY0zg.png)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/perf-keeper.ext.connection.js */

perfKeeperExtConnection.networkInformation(perfKeeper.system);
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { networkInformation } from '@perf-tools/keeper/ext/connection';

networkInformation(system);

// or with options
networkInformation(system, {
	// Fox example: effectiveType -> old -> new
	sendChanged: true,
});
```
