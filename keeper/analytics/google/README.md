Google Analytics
----------------
- [Behavior -> Site Speed -> User Timings](https://analytics.google.com/analytics/web/)
- https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/analytics/google.js */

perfKeeper.system.listen(perfKeeperAnalyticsGoogle.googleAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { googleAnalytics } from '@perf-tools/keeper/analytics/google';

system.setAnalytics([googleAnalytics()]);

// OR
system.setAnalytics([googleAnalytics({
	prefix: 'MyApp-',
})]);
```
