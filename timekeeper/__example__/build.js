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
		${readFileSync('../timekeeper.dev.js')}
		${Object.entries({
			navigation: 'timekeeperTimingsNavigation.navigationTimings',
			paint: 'timekeeperTimingsPaint.paintTimings',
		}).map(([name, method]) => `
			// ${name}
			${readFileSync(`../timekeeper.timings.${name}.js`)}
			${method}(timekeeper.system);
		`).join('\n')}
		$2`,
	),
);