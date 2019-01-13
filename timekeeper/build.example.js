const {
	readFileSync,
	writeFileSync,
} = require('fs');

const content = readFileSync('./index.html') + '';

writeFileSync(
	'./index.html',
	content.replace(
		/(<script id="tk">)[\s\S]*?(<\/script>)/,
		`$1

		// TimeKeeper
		${readFileSync('./timekeeper.dev.js')}

		// Plugins
		${Object.entries({
			navigation: 'timekeeperTimingsNavigation.navigationTimings',
			paint: 'timekeeperTimingsPaint.paintTimings',
			interactive: 'timekeeperTimingsInteractive.interactiveTimings',
		}).map(([name, method]) => `
			// Timings: ${name}
			${readFileSync(`./timekeeper.timings.${name}.js`)}
			${method}(timekeeper.system);
		`).join('\n')}

		// Analytics
		const analytics = [];
		${Object.entries({
			google: 'timekeeperAnalytics.googleAnalytics',
		}).map(([name, method]) => `
			// Analytics: ${name}
			${readFileSync(`./timekeeper.analytics.${name}.js`)}
			analytics.push(${method}());
		`).join('\n')}

		timekeeper.system.setAnalytics(analytics);

		$2`,
	),
);