import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import dts from 'rollup-plugin-dts';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonJs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
];

const plugins = [
    nodeResolve(),
    commonJs(),
    typescript({ module: "esnext" }),
];

let pluginsD365 = [...plugins];

let sourcemap = "inline";

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
    pluginsD365.push(babel({
        babelHelpers: "bundled",
        presets: [["env"]]
    }));
    pluginsD365.push(terser());

    sourcemap = false;
}

export default [
    // Public API (cjs)
    {
        input: 'src/d365-client.ts',
        plugins,
        external,
        output: { format: 'cjs', file: pkg.main, sourcemap },
    },
    // Public API (dts)
    {
        input: 'build/d365-client.d.ts',
        plugins: [dts()],
        external,
        output: { format: 'cjs', file: pkg.types},
    },
    // Public API (esm)
    {
        input: 'src/d365-client.ts',
        plugins,
        external,
        output: { format: 'esm', file: pkg.module, sourcemap },
    },
];