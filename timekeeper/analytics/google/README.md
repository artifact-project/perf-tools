Google Analytics
----------------
- [Behavior -> Site Speed -> User Timings](https://analytics.google.com/analytics/web/)
- https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/timekeeper.js */
/* Paste code from ./dist/timekeeper.analytics.google.js */

timekeeper.system.listen(timekeeperAnalytics.googleAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { googleAnalytics } from '@perf-tools/timekeeper/analytics/google';

system.setAnalytics([googleAnalytics()]);

// OR
system.setAnalytics([googleAnalytics({
	prefix: 'MyApp-',
})]);
```
