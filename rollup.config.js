import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import commonJs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
];

const inputFile = 'src/dataverse-client.ts';

let sourceMap = true;

const additionalPlugins = [];

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
    sourceMap = false;
    additionalPlugins.push(terser())
}

const plugins = [
    nodeResolve(),
    commonJs(),
    typescript({ module: "esnext", sourceMap }),
    ...additionalPlugins
];

export default [
    // CJS
    {
        input: inputFile,
        plugins,
        external,
        output: { format: 'cjs', file: pkg.main, sourcemap: sourceMap },
    },
    // DTS
    {
        input: inputFile,
        plugins: [dts()],
        external,
        output: { format: 'cjs', file: pkg.types},
    },
    // ESM
    {
        input: inputFile,
        plugins,
        external,
        output: { format: 'esm', file: pkg.module, sourcemap: sourceMap },
    },
];