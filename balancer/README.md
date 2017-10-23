@perf-tools/balancer
--------------------
A tool for load balancing within the limit of a single frame and not only.

```
npm i --save @perf-tools/balancer
```

### Description
Often, need to reduce the load, for example when listening to the `onscroll`
event or take the operation as deferred. Usually, in such a situation we use:
`debounce` and` throttle`. These are very good tools, but sometimes want more,
namely controlling the execution within one frame of the animation or use idle-process.

It is for this created `@perf-tools/balancer`. You add deferred calls into it,
and it controls that their execution does not take more than 13ms, otherwise it
moves them to [idle-process](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).


---


### API

 - [call](#call) — add a deferred call to a balancer
 - [debounce](#debounce) — created a debounced function
 - [cancel](#cancel) — cancel a deferred call
 - [uniqueKey](#uniqueKey) — a factory of unique keys to replacing a deferred call, with the same key
 - [Bits](#bits) — advanced knowledge

---

<a name="call"></a>
#### call(fn, ctx?, args?, options?): `Task`
Add a deferred call to a balancer.

 - **fn**: `Function`
 - **ctx**: `object`
 - **args**: `any[]`
 - **options**: `TaskOptions`
   - **key**: `TaskUniqueKey`
   - **flags**: `number` — [a bitmask](#bits)

```ts
import {call} from '@perf-tools/balancer';

call(function () {
	// some code
});
```

---

<a name="debounce"></a>
#### debounce(fn, ctx?, args?, options?): `DebouncedFunction`
Created a debounced function

 - **fn**: `Function`
 - **ctx**: `object`
 - **args**: `any[]`
 - **options**: `TaskOptions`
   - **key**: `TaskUniqueKey`
   - **flags**: `number` — [a bitmask](#bits)


```ts
import {debounce} from '@perf-tools/balancer';

const handleScroll = debounce(function () {
	// some code
});

document.addEventListener('scroll', handleScroll, true);

// Anywhere else
handleScroll.cancel(); // cancel a deferred call
document.addEventListener('scroll', handleScroll, true);
```

---

<a name="cancel"></a>
#### cancel(task: Task)
Cancel a deferred call

 - **task**: `Task` — the task of a deferred call

```ts
import {call, cancel} from '@perf-tools/balancer';

const task = call(function () {
	// some code
});

// Anywhere else
cancel(task);
```

---

<a name="uniqueKey"></a>
#### uniqueKey(name: string): `TaskUniqueKey`
A factory of unique keys to replacing a deferred call, with the same key

 - **name**: `name` — any name (does not affect anything)

```ts
import {call, uniqueKey} from '@perf-tools/balancer';

const key = uniqueKey('demo');

call(function () { console.log('One'); }, null, [], {key});
call(function () { console.log('Two'); }, null, [], {key});

// Console output:
//  Two
```

---

<a name="bits"></a>
#### Bits

 - `F_NO_ARGS` — ignore arguments for boost performance a debounced function
 - `F_IMPORTANT` — even if the task is too heavy, it will not be moved to the idle-mode and will continue to run per frame

---


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
