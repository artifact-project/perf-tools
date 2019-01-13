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

		$2`,
	),
);