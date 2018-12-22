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
	{
		input: 'index.ts',
		output: {
			file: 'timekeeper.js',
			format: 'iife',
			name: 'timekeeper',
		},
		plugins,
	},

	{
		input: 'index.ts',
		output: {
			file: 'timekeeper.dev.js',
			format: 'iife',
			name: 'timekeeper',
		},
		plugins: plugins.slice(0, -1),
	},

	// Plugins
	[
		'navigation',
		'paint',
	].map(name => ({
		input: `./timings/${name}/index.ts`,
		output: {
			file: `timekeeper.${name}.js`,
			format: 'iife',
			name: `timekeeper${name.charAt(0).toUpperCase()}${name.substr(1)}`,
		},
		plugins,
	}))
);