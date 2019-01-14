const {
	readFileSync,
	writeFileSync,
} = require('fs');
const UglifyJS = require('uglify-js');
const pkg = require('./package.json');
const exampleContent = readFileSync('./index.html') + '';
const timings = [];

// Example
writeFileSync(
	'./index.html',
	exampleContent.replace(
		/(<script id="tk">)[\s\S]*?(<\/script>)/,
		`$1

		// TimeKeeper
		${readFileSync('./dist/timekeeper.dev.js')}

		// Plugins
		${Object.entries({
			navigation: 'timekeeperTimingsNavigation.navigationTimings',
			paint: 'timekeeperTimingsPaint.paintTimings',
			performance: 'timekeeperTimingsPerformance.performanceTimings',
		}).map(([name, method]) => {
			const content = [
				`// Timings: ${name}`,
				readFileSync(`./dist/timekeeper.timings.${name}.js`),
				`${method}(timekeeper.system);`,
			].join('\n');
			timings.push(content);
			return content;
		}).join('\n')}

		// Analytics
		const analytics = [];
		${Object.entries({
			google: 'timekeeperAnalyticsGoogle.googleAnalytics',
		}).map(([name, method]) => `
			// Analytics: ${name}
			${readFileSync(`./dist/timekeeper.analytics.${name}.js`)}
			analytics.push(${method}());
		`).join('\n')}

		timekeeper.system.setAnalytics(analytics);

		$2`,
	),
);

// TimeKeeper with Timings
writeFileSync(
	'./dist/timekeeper.with-timings.js', [
		`//`,
		`// TimeKeeper v${pkg.version} | ${pkg.license}`,
		`// ${pkg.homepage}`,
		`//`,
		UglifyJS.minify([
			readFileSync('./dist/timekeeper.js'),
			timings.join('\n'),
		].join('\n')).code,
	].join('\n'),
);