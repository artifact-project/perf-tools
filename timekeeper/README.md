@perf-tools/timekeeper
----------------------
Time profiling helper

```
npm i --save @perf-tools/timekeeper
```

### Usage

```html
<html>
<head>
	<script>
		/**
		 * Copy and past code from file:
		 * https://github.com/artifact-project/perf-tools/blob/master/timekeeper/timekeeper.js
		 */
		var keeper = timekeeper.create({print: true});
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
		keeper.group('app', function (grouped) {
			keeper.time('require');

			require(['app/bootstrap'], grouped(function (bootstrap) {
				keeper.timeEnd('require');

				keeper.time('boot');
				bootstrap(document)
				keeper.timeEnd('boot');
			}));
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


---


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
