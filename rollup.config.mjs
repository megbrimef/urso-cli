import pack from './package.json' assert { type: "json" };

import ts from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

export default {
	input: 'src/urso.ts',
	output: {
		sourcemap: true,
		file: 'bin/urso.js',
		format: 'cjs'
	},
	external: ['fs', 'commander', 'util', 'path', 'child_process', 'free-tex-packer-core'],
    plugins: [
        ts(),
		json(),
		replace({
			preventAssignment: true,
			__APP_VERSION__: pack.version
		})
    ]
};
