import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import ts from 'typescript';

const plugins = [].concat(
	// license({
	// 	banner: `${pkg.name} v${pkg.version} | ${pkg.license} | ${pkg.homepage}`,
	// }),
	nodeResolve({
	}),

	typescript({
		tsconfig: './tsconfig.rollup.json',
		declaration: false,
		typescript: ts,
	}),

	replace({
		'process.env.NODE_ENV': JSON.stringify('production'),
	}),

	uglify(),
	// terser(),
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

	// Addon: console
	{
		input: './addon/console/index.ts',
		output: {
			file: './dist/perf-keeper.addon.console.js',
			format: 'iife',
			name: 'perfKeeperConsoleAddon',
		},
		plugins,
	},

	// Addon: timeline
	{
		input: './addon/timeline/index.ts',
		output: {
			file: './dist/perf-keeper.addon.timeline.js',
			format: 'iife',
			name: 'perfKeeperTimelineAddon',
		},
		plugins,
	},
);

function toCamelCase(s) {
	return s.replace(/-(.)/g, (_, chr) => chr.toUpperCase());
}
