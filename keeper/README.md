@perf-tools/keeper (aka PerfKeeper)
-----------------------------------
PerfKeeper — It's a tool for performance monitoring and profiling your application (also best replacement for `console.time`).

- ➡️ &nbsp; [Living example of work](https://artifact-project.github.io/perf-tools/keeper/) &nbsp; 😲

```sh
npm i --save @perf-tools/keeper
```

---

### Features

 - Groups! 🗂
 - DevTools -> Performance -> UserTiming 💡
 - Output -> DevTools / Console or custom output 💬
 - Out of box ⚡️
   - Monitorings ⏱
	 - [FPS](./ext/fps) 🌀
     - [Navigation Connection](./ext/connection) 🎛
     - [Navigation Timings](./ext/navigation) 🚏
     - [Paint Timings](./ext/paint): [FCP](https://web.dev/first-contentful-paint/) / [LCP](https://web.dev/lcp/) / [CLS](https://web.dev/cls/) 🏞
	 - [Performance](./ext/performance): [FID](https://web.dev/fid/) / [TBT](https://web.dev/tbt/) / [TTI](https://web.dev/tti/) 🚀
	 - [Resource/Traffic](./ext/resource) ⚖️
	 - [Memory](./ext/memory) 🤖
   - Addons ✨
     - [console](./addon/console)
     - [timeline](./addon/timeline)

---

### Usage

```ts
// System keeper
import { system } from '@perf-tools/keeper';


// Custom keeper
import { create } from '@perf-tools/keeper';
import { googleAnalytics } from '@perf-tools/keeper/analytics/google';

const keeper = perfKeeper.create({
	print: true,    // DevTools -> Console
	timeline: true, // DevTools -> Performance -> User timings
	prefix: '⏱',
	analytics: [
		googleAnalytics({prefix: 'MyApp-'}),
	],
});

// 1. Classic usage variant
keeper.time('FooBar');
// ...
keeper.timeEnd('FooBar'); // ⏱FooBar: 37ms

// 2. Shorted usage variant
const timer = keeper.time('FooBar'); // ⏱FooBar: 37ms
// ...
timer.stop();

// 3. Functional usage variant
keeper.time('FooBar', () => { // ⏱FooBar: 37ms
	// ...
});

// 4. Usage variant with groups
const group = keeper.group('App');
group.mark('init'); // starting 'init' timer
// ...

group.mark('prepare'); // ending 'init' and starting 'prepare' timer
// ...

group.mark('render'); // ending 'prepare' and starting 'render' timer
// ...

group.stop(); // starting 'render' timer

// ⏱App: 382ms
//    ⏱init: 243ms
//    ⏱prepare: 19ms
//    ⏱render: 120ms
```


### Inline Usage

```html
<html>
<head>
	<script>
		/**
		 * Replace this comment on the code from this files:
		 *  - ./dist/perf-keeper.js
		 *  - ./dist/perf-keeper.extentions.js
		 *  - ./dist/perf-keeper.analytics.google.js
		 */

		// Setup system keeper
		perfKeeper.system.print(true);
		perfKeeper.system.setAnalytics([perfKeeperAnalyticsGoogle.googleAnalytics()]);
		perfKeeperExtentions.set(perfKeeper.system);

		// Create custom keeper
		var keeper = perfKeeper.create({
			print: true,    // DevTools -> Console
			timeline: true, // DevTools -> Performance
			prefix: '⏱',
			analytics: [
				perfKeeperAnalyticsGoogle.googleAnalytics({
					prefix: 'MyApp-',
				}),
			],
		});
		keeper.group('head');
	</script>

	<script>
		keeper.time('icon');
	</script>
	<link rel="shortcut icon" type="image/x-icon" href="..."/>
	<link rel="apple-touch-icon" href="..." />
	<!-- etc -->
	<script>
		keeper.timeEnd('icon');
		keeper.time('css');
	</script>
	<link type="text/css" rel="stylesheet" href="..."/>
	<!-- etc -->
	<script>
		keeper.timeEnd('css');
		keeper.groupEnd();
	</script>
</head>
<body>
	<script>
		keeper.group('body');
	</script>
	<!-- ... -->
	<script>
		keeper.time('javascript');
	</script>
	<script src="./boot/loader"></script>
	<!-- etc -->
	<script>
		keeper.timeEnd('javascript');

		const gapp = keeper.group('app', true);

		gapp.mark('require');
		require(['app/bootstrap'], (bootstrap) => {
			gapp.mark('boot');
			bootstrap(document);
			gapp.stop();
		});
	</script>
	<!-- ... -->
	<script>
		keeper.groupEnd();
	</script>
</body>
</html>
```

---

### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
