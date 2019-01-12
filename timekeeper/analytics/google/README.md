Google Analytics
----------------
- https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./timekeeper.js */
/* Paste code from ./timekeeper.analytics.google.js */

timekeeper.system.listen(timekeeperAnalytics.googleAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { googleAnalytics } from '@perf-tools/timekeeper/analytics/google';

system.listen(googleAnalytics());
```
