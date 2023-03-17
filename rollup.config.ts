import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import terser from '@rollup/plugin-terser';
import commonJs from '@rollup/plugin-commonjs';
import { readFileSync } from "fs";
import { Plugin, RollupOptions } from 'rollup';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const external: string[] = [
    ...Object.keys("dependencies" in pkg ? pkg.dependencies as Record<string, unknown> : {}),
    ...Object.keys("peerDependencies" in pkg ? pkg.peerDependencies as Record<string, unknown> : {}),
];

const inputFile = 'src/index.ts';

let sourceMap = true;

const additionalPlugins: Plugin[] = [];

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
    sourceMap = false;
    additionalPlugins.push(terser());
}

const plugins = [
    nodeResolve(),
    commonJs(),
    typescript({ module: "esnext", sourceMap, compilerOptions: { rootDir: "./src" } }),
    ...additionalPlugins
];

export default function(
    //command: Record<string, unknown>
): RollupOptions[] {
    return [
        // CJS
        {
            input: inputFile,
            plugins,
            external,
            output: { format: 'cjs', file: pkg.main, sourcemap: sourceMap },
        },
        // ESM
        {
            input: inputFile,
            plugins,
            external,
            output: { format: 'esm', file: pkg.module, sourcemap: sourceMap },
        },
    ];
};