MailRu Analytics
----------------
- XRay (aka Radar)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/timekeeper.js */
/* Paste code from ./dist/timekeeper.analytics.mailru.js */

timekeeper.system.listen(timekeeperAnalytics.mailruAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { mailruAnalytics } from '@perf-tools/timekeeper/analytics/mailru';

system.setAnalytics([mailruAnalytics()]);

// or with options
system.setAnalytics([mailruAnalytics({
	prefix: 'split_',
	project: 'login', // optional
})]);
```
