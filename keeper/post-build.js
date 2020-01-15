const {
	readFileSync,
	writeFileSync,
} = require('fs');
const UglifyJS = require('uglify-js');
const pkg = require('./package.json');
const exampleContent = readFileSync('./index.html') + '';
const timings = [];
const banner = [
	`//`,
	`// ${pkg.name} v${pkg.version} | ${pkg.license}`,
	`// ${pkg.homepage}`,
	`//`,
].join('\n');

// Example
writeFileSync(
	'./index.html',
	exampleContent.replace(/(<script id="perf-keeper">)[\s\S]*?(<\/script>)/, [].concat(
		'$1',
		banner,
		readFileSync('./dist/perf-keeper.dev.js'),

		'// Extensions',
		Object.entries({
			fps: 'perfKeeperExtFps.fpsMeter',
			connection: 'perfKeeperExtConnection.networkInformation',
			navigation: 'perfKeeperExtNavigation.navigationTimings',
			paint: 'perfKeeperExtPaint.paintTimings',
			performance: 'perfKeeperExtPerformance.performanceTimings',
			resource: 'perfKeeperExtResource.resourceStats',
			memory: 'perfKeeperExtMemory.memoryStats',
		}).map(([name, method]) => {
			const content = [
				`// Ext: ${name}`,
				readFileSync(`./dist/perf-keeper.ext.${name}.js`),
				`${method}(perfKeeper.system);`,
			].join('\n');
			timings.push(content);
			return content;
		}),

		'// Analytics',
		'const analytics = [];',
		Object.entries({
			google: 'perfKeeperAnalyticsGoogle.googleAnalytics()',
			yandex: 'perfKeeperAnalyticsYandex.yandexAnalytics({id: "51955373"})',
		}).map(([name, init]) => `
			// Analytics: ${name}
			${readFileSync(`./dist/perf-keeper.analytics.${name}.js`)}
			analytics.push(${init});
		`),

		'perfKeeper.system.setAnalytics(analytics)',
		'$2',
	).join('\n')),
);
