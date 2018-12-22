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
			navigation: 'timekeeperNavigation.navigationTimings',
			paint: 'timekeeperPaint.paintTimings',
		}).map(([name, method]) => `
			// ${name}
			${readFileSync(`../timekeeper.${name}.js`)}
			${method}(timekeeper.system);
		`).join('\n')}
		$2`,
	),
);