Yandex Metrika
--------------
- https://metrika.yandex.ru/
- https://yandex.ru/support/metrika/data/visit-params.html

---

### Usage

#### Inline

```html
<script>
/* Paste code from ./dist/perf-keeper.js */
/* Paste code from ./dist/analytics/yandex.js */

perfKeeper.system.listen(perfKeeperAnalyticsYandex.yandexAnalytics());
</script>
```

---

#### As Module

```ts
import { system } from '@perf-tools/keeper';
import { yandexAnalytics } from '@perf-tools/keeper/analytics/yandex';

system.setAnalytics([yandexAnalytics()]);

// OR
system.setAnalytics([yandexAnalytics({
	prefix: 'MyApp-',
})]);
```
