# ⚠️ **DEPRECATED**: Use @perf-tools/keeper ⚠️


@perf-tools/timekeeper
----------------------
TimeKeeper — It's a time profiling helper and good replacement for `console.time`.
- [See Example](https://artifact-project.github.io/perf-tools/timekeeper/)

```sh
npm i --save @perf-tools/timekeeper
```

---

### Features

 - Groups! 🗃
 - DevTools -> Performance -> UserTiming 💡
 - Output -> DevTools / Console or custom output 💬
 - Out of box ⚡️
   - Timings ⏱
     - [Navigation Timings](./timings/navigation) 🚏
     - [Paint Timing](./timings/paint) 🏞
     - [Performance](./timings/performance) 🚀
   - Analytics 📈
     - [Google](./analytics/google)

 ---

### Usage

```html
<html>
<head>
	<script>
		/**
		 * Replace this comment on the code from this files:
		 *  - https://github.com/artifact-project/perf-tools/blob/master/timekeeper/dist/timekeeper.with-timings.js
		 *  - https://github.com/artifact-project/perf-tools/blob/master/timekeeper/dist/timekeeper.analytics.google.js
		 */

		// Setup system keeper
		timekeeper.print(true);
		timekeeper.setAnalytics([timekeeperAnalyticsGoogle.googleAnalytics()]);

		// Create custom keeper
		var keeper = timekeeper.create({
			print: true,    // DevTools -> Console
			timeline: true, // DevTools -> Performance
			prefix: '⏱',
			analytics: [
				timekeeperAnalyticsGoogle.googleAnalytics({
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

### API

- **create**(options: `KeeperOptions`): `TimeKeeper`
  - **options**
    - **disabled**: `boolean`
    - **print**: `boolean`
	- **perf**: `Partial<Performance>`
	- **console**: `Partial<Console>`
	- **timeline**: `boolean`
	- **analytics**: `Array<(entry: Entry) => void>`
	- **warn**: `(msg: string) => void`
  - **TimeKeeper**
    - **print**: `(enable?: boolean) => void`
    - **disable**: `(state: boolean) => void`
    - **setAnalytics**: `(list: Array<(entry: Entry) => void>) => void`
    - **add**(name: `string`, start: `number`, end: `number`): `Entry`
    - **time**(name: `string`, start?: `number`): `Entry`
    - **timeEnd**(name: `string`, end?: `number`): `void`
    - **group**(name: `string`): `GroupEntry`
    - **group**(name: `string`, isolate: `true`): `GroupEntry`
    - **group**(name: `string`, start: `number`, isolate?: `true`): `GroupEntry`
    - **groupEnd**(name?: `string`, end?: `number`): `void`
  - **Entry**
    - **id**: `string` — unique identifier
    - **name**: `string` — name of measure
    - **start**: `number` — start mark
    - **end**: `number` — end mark
    - **parent**: `GroupEntry | null` — reference on parent
	- **stop**(end?: `number`): `void` — complete the measurement (set `end` prop)
  - **GroupEntry** (extends `Entry`)
    - **entries**: `Entry[]` — nested metrics
	- **add**(name: `string`, start: `number`, end: `number`): `Entry`
    - **time**(name: `string`, start?: `number`): `Entry`
    - **timeEnd**(name: `string`, end?: `number`): `void`
    - **mark**(name: `string`): `void`
    - **group**(name: `string`): `GroupEntry`

---

### Examples

#### Console

![DevTools / Console](./__docs__/console.png)

---

#### User Timing aka Timeline

![DevTools / Timelime](./__docs__/timeline.png)

---

### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
