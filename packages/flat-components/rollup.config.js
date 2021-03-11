import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import styles from "rollup-plugin-styles";
import ignoreImport from "rollup-plugin-ignore-import";
import url from "@rollup/plugin-url";

const plugins = [peerDepsExternal(), resolve(), commonjs(), typescript(), url()];

const rollupConfig = [
    {
        input: "./src/index.ts",
        output: {
            dir: "./build/",
            format: "esm",
            preserveModules: true,
            preserveModulesRoot: "src",
            sourcemap: true,
            assetFileNames: assetInfo => {
                return assetInfo.name.endsWith(".css")
                    ? "css/[name][extname]"
                    : "assets/[name][extname]";
            },
        },
        plugins: [...plugins, styles({ mode: "extract", sourceMap: true })],
    },
    {
        input: "./src/index.ts",
        output: {
            dir: "./build/cjs/",
            format: "cjs",
            preserveModules: true,
            preserveModulesRoot: "src",
            sourcemap: true,
        },
        plugins: [
            ...plugins,
            ignoreImport({
                extensions: [".less", ".css", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"],
            }),
        ],
    },
];

export default rollupConfig;
