import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import ts from 'typescript';
import pkg from './package.json';


export default [].concat(
	createBundle('inline.ts', {file: pkg.iife, format: 'iife', name: 'perfKeeper'}, true),
	createBundle('index.ts', {file: pkg.module, format: 'es'}, false),
	createBundle('index.ts', {file: pkg.main, format: 'cjs'}, false),
	
	// Addon: console
	createBundle(
		'./addon/console/index.ts',
		{
			file: './dist/keeper.addon.console.js',
			format: 'iife',
			name: 'perfKeeperConsoleAddon',
		},
		true,
	),

	// Addon: timeline
	createBundle(
		'./addon/timeline/index.ts',
		{
			file: './dist/keeper.addon.timeline.js',
			format: 'iife',
			name: 'perfKeeperTimelineAddon',
		},
		true
	),
);

function createBundle(input, output, min) {
	const plugins = [
		nodeResolve({}),

		typescript({
			tsconfig: './tsconfig.rollup.json',
			declaration: false,
			typescript: ts,
		}),

		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			'process.env.PKG_VERSION': JSON.stringify(pkg.version),
		}),
	];

	if (min) {
		plugins.push(terser());
	}

	return {
		input,
		output: output,
		plugins,
	};
}
