import path from "path";
import fs from "fs";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import styles from "rollup-plugin-styles";
import ignoreImport from "rollup-plugin-ignore-import";
import url from "@rollup/plugin-url";

const compNames = fs
    .readdirSync(path.resolve(__dirname, "src", "components"))
    .filter(name => !name.startsWith("."));

const containerNames = fs
    .readdirSync(path.resolve(__dirname, "src", "containers"))
    .filter(name => !name.startsWith("."));

generateIndexTS({
    components: compNames,
    containers: containerNames,
});

const commonPlugins = [
    resolve({ browser: true }),
    commonjs(),
    peerDepsExternal({
        packageJsonPath: path.join(__dirname, "package.json"),
    }),
    url({
        limit: Infinity,
    }),
];

// ignore assets that are not picked up by url plugin
const ignoreAssets = ignoreImport({
    extensions: [".less", ".css"],
});

const extractCSS = styles({
    mode: "extract",
    sourceMap: true,
    url: false, // disable url parsing for antd
    less: {
        javascriptEnabled: true,
    },
});

const rollupConfig = [...getMainEntryConfig()];
if (process.env.INCLUDE_COMPONENT_ENTRIES) {
    rollupConfig.push(...getAllComponentConfigs(compNames));
}

export default rollupConfig;

/**
 * Bundle all components into one file.
 */
function getMainEntryConfig() {
    const input = "./src/index.ts";
    const sharedPlugins = [
        ...commonPlugins,
        typescript({
            clean: true,
        }),
    ];

    return [
        {
            input,
            output: {
                dir: "./build/",
                format: "esm",
                sourcemap: true,
                assetFileNames,
            },
            plugins: [...sharedPlugins, extractCSS],
        },
        {
            input,
            output: {
                dir: "./build/cjs",
                format: "cjs",
                sourcemap: true,
            },
            plugins: [...sharedPlugins, ignoreAssets],
        },
    ];
}

/**
 * Merge all component configs
 */
function getAllComponentConfigs(compNames) {
    return compNames.map(getComponentConfig);
}

/**
 * Bundle each component into its own directory.
 */
function getComponentConfig(name) {
    const input = path.resolve(__dirname, "src", "components", name, "index.tsx");

    const sharedPlugins = [
        ...commonPlugins,
        typescript({
            tsconfig: "tsconfig.base.json",
            tsconfigOverride: {
                include: [`src/components/${name}/**/*`],
            },
            // already checked in main entry bundling
            check: false,
            clean: true,
        }),
    ];

    return {
        input,
        output: {
            dir: path.resolve(__dirname, "build", "components", name),
            format: "esm",
            sourcemap: true,
        },
        plugins: [...sharedPlugins, ignoreAssets],
    };
}

/**
 * generate index.ts which includes all the components
 */
function generateIndexTS(config) {
    const srcDir = path.resolve(__dirname, "src");

    const str =
        fs.readFileSync(path.resolve(__dirname, "scripts", "index.js.template"), "utf-8") +
        Object.keys(config)
            .map(folder =>
                config[folder].map(name => `export * from "./${folder}/${name}";`).join("\n"),
            )
            .join("\n") +
        "\n";

    fs.writeFileSync(path.join(srcDir, "index.ts"), str);
}

function assetFileNames(assetInfo) {
    return assetInfo.name.endsWith(".css") ? "style.css" : "assets/[name][extname]";
}
