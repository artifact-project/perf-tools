import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
// import license from 'rollup-plugin-license';
import { uglify } from 'rollup-plugin-uglify';
// import pkg from './package.json';
import ts from 'typescript';

export default {
	input: 'index.ts',
	output: {
		file: 'timekeeper.js',
		format: 'iife',
		name: 'timekeeper',
	},
	plugins: [].concat(
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
	),
};