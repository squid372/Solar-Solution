import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuildImport from 'rollup-plugin-esbuild';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

// Interop: under `--bundleConfigAsCjs` the default export is wrapped in `.default`.
const esbuild = esbuildImport.default ?? esbuildImport;

const isWatch = process.env.ROLLUP_WATCH === 'true';

const plugins = [
  nodeResolve({
    jsnext: true,
    main: true,
  }),
  commonjs(),
  // esbuild handles TS -> JS including legacy decorators (experimentalDecorators
  // from tsconfig), replacing the previous rollup-plugin-typescript2 + babel
  // chain which could not parse decorated accessors under newer toolchains.
  esbuild({
    include: /\.[jt]s$/,
    exclude: /node_modules/,
    target: 'es2021',
    tsconfig: 'tsconfig.json',
    sourceMap: true,
    minify: false,
  }),
  json(),
  // Only minify in non-watch (build) mode for better dev experience
  !isWatch && terser(),
].filter(Boolean);

export default {
  input: ['./src/index.ts'],
  output: {
    file: 'dist/solar-solution.js',
    format: 'esm',
    name: 'SunsynkPowerFlowCard',
    inlineDynamicImports: true,
    sourcemap: true,
  },
  watch: {
    clearScreen: false,
  },
  plugins: [...plugins],
  onwarn: function (warning, handler) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }

    // console.warn everything else
    handler(warning);
  },
};
