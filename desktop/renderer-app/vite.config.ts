import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
// TODO: find new place to store vite-plugin-dotenv
import { dotenv } from "../../web/flat-web/scripts/vite-plugin-dotenv";
import { visualizer } from "rollup-plugin-visualizer";
import { electron } from "./scripts/vite-plugin-electron";
import eslintPlugin from "vite-plugin-eslint";
import {
    configPath,
    typesEntryPath,
    i18nEntryPath,
    componentsEntryPath,
} from "../../scripts/constants";

export default defineConfig(() => {
    const plugins = [refresh(), dotenv(configPath), electron(), eslintPlugin()];
    if (process.env.ANALYZER) {
        plugins.push({
            ...visualizer(),
            enforce: "post",
            apply: "build",
        });
    }
    return {
        base: "./",
        plugins,
        resolve: {
            alias: [
                // replace webpack alias
                {
                    find: /^~/,
                    replacement: "",
                },
                {
                    find: "flat-types",
                    replacement: typesEntryPath,
                },
                {
                    find: "flat-i18n",
                    replacement: i18nEntryPath,
                },
                {
                    find: "flat-components",
                    replacement: componentsEntryPath,
                },
            ],
        },
        build: {
            sourcemap: true,
            /**
             * Vite will generate resources in assets folder after build，
             * but index.html with './' relative path load module,
             * instead of the default 'assets' folder.
             */
            assetsDir: "",
            rollupOptions: {
                output: {
                    format: "cjs",
                },
                external: [...electron.externals],
            },
        },
        clearScreen: false,
        optimizeDeps: {
            exclude: [...electron.externals, "fs-extra", "extract-zip"],
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                    modifyVars: {
                        "primary-color": "#3381FF",
                        "link-color": "#3381FF",
                    },
                },
            },
        },
    };
});
