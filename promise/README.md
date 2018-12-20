@perf-tools/promise
-------------------
Lazy Promise creates native Promise only if you use `then` or `catch` methods.

```sh
npm i --save @perf-tools/promise
```

---

### Usage

```ts
import { LazyPromise } from '@perf-tools/promise';

const lazy = new LazyPromise((resolve) => {
	resolve('LAZY!');
});

console.log('Like native:', lazy instanceof Promise); // Like native: true
console.log('Lazy?', lazy instanceof LazyPromise); // Lazy? true

// Activation (create Native Promise)
lazy.then((val) => {
	console.log('result:', val); // result: LAZY!
});
```

---

### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
