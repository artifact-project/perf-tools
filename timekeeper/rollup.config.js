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
			file: './dist/timekeeper.js',
			format: 'iife',
			name: 'timekeeper',
		},
		plugins,
	},

	// Dev
	{
		input: 'index.ts',
		output: {
			file: './dist/timekeeper.dev.js',
			format: 'iife',
			name: 'timekeeper',
		},
		plugins: plugins.slice(0, -1),
	},

	// Plugins
	[
		'navigation',
		'paint',
		'performance',
	].map(name => ({
		input: `./timings/${name}/index.ts`,
		output: {
			file: `./dist/timekeeper.timings.${name}.js`,
			format: 'iife',
			name: toCamelCase(`timekeeper-timings-${name}`),
		},
		plugins,
	})),

	// Analytics
	[
		'google',
		'mailru',
	].map(name => ({
		input: `./analytics/${name}/index.ts`,
		output: {
			file: `./dist/timekeeper.analytics.${name}.js`,
			format: 'iife',
			name: toCamelCase(`timekeeper-analytics-${name}`),
		},
		plugins,
	})),
);

function toCamelCase(s) {
	return s.replace(/-(.)/g, (_, chr) => chr.toUpperCase());
}