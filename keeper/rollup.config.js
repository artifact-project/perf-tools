import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
// import license from 'rollup-plugin-license';
import { uglify } from 'rollup-plugin-uglify';
// import pkg from './package.json';
import ts from 'typescript';

const plugins = [].concat(
	// license({
	// 	banner: `${pkg.name} v${pkg.version} | ${pkg.license} | ${pkg.homepage}`,
	// }),
	typescript({
		declaration: false,
		typescript: ts,
	}),

	replace({
		'process.env.NODE_ENV': JSON.stringify('production'),
	}),

	uglify(),
);

export default [].concat(
	// Prod
	{
		input: 'index.ts',
		output: {
			file: './dist/perf-keeper.js',
			format: 'iife',
			name: 'perfKeeper',
		},
		plugins,
	},

	// All extenstions
	{
		input: 'extensions.ts',
		output: {
			file: './dist/perf-keeper.extensions.js',
			format: 'iife',
			name: 'perfKeeperExtensions',
		},
		plugins,
	},

	// Dev
	{
		input: 'index.ts',
		output: {
			file: './dist/perf-keeper.dev.js',
			format: 'iife',
			name: 'perfKeeper',
		},
		plugins: plugins.slice(0, -1),
	},

	// Extensions
	[
		'fps',
		'navigation',
		'paint',
		'performance',
		'resource',
		'memory',
	].map(name => ({
		input: `./ext/${name}/index.ts`,
		output: {
			file: `./dist/perf-keeper.ext.${name}.js`,
			format: 'iife',
			name: toCamelCase(`perf-keeper-ext-${name}`),
		},
		plugins,
	})),

	// Analytics
	[
		'google',
		'yandex',
		'mailru',
	].map(name => ({
		input: `./analytics/${name}/index.ts`,
		output: {
			file: `./dist/perf-keeper.analytics.${name}.js`,
			format: 'iife',
			name: toCamelCase(`perf-keeper-analytics-${name}`),
		},
		plugins,
	})),
);

function toCamelCase(s) {
	return s.replace(/-(.)/g, (_, chr) => chr.toUpperCase());
}