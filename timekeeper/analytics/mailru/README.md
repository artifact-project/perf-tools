MailRu Analytics
----------------
- XRay (aka Radar)

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./timekeeper.js */
/* Paste code from ./timekeeper.analytics.mailru.js */

timekeeper.system.listen(timekeeperAnalytics.mailruAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/timekeeper';
import { mailruAnalytics } from '@perf-tools/timekeeper/analytics/mailru';

system.listen(mailruAnalytics());
```
