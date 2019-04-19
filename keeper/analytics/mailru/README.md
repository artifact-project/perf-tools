MailRu Analytics
----------------
- XRay (aka Radar)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/analytics/mailru.js */

perfKeeper.system.listen(perfKeeperAnalyticsMailru.mailruAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { mailruAnalytics } from '@perf-tools/keeper/analytics/mailru';

system.setAnalytics([mailruAnalytics()]);

// or with options
system.setAnalytics([mailruAnalytics({
	prefix: 'split_',
	project: 'login', // optional
	normalize: names => ( // optional
		names.map(metrica => metrica
			.replace(/resource/g, 'res')
			.replace(/navigation/g, 'nav')
		)
	),
})]);
```
