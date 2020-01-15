Navigator Connection
--------------------
- https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
- https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API

---

Initial|Changed
---|---
![Initial](https://cdn-images-1.medium.com/max/1600/1*FDs0-X-t-REdZUCRLq9Aew.png)|![Changed](https://cdn-images-1.medium.com/max/2400/1*THcu6G9ST884gugAQXWF6w.png)

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
	sendChanged: false,
});
```
