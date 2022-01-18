import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import { visualizer } from "rollup-plugin-visualizer";
import copy from "rollup-plugin-copy";
import path from "path";

// TODO: find new place to store vite-plugin-dotenv
import { dotenv } from "../../web/flat-web/scripts/vite-plugin-dotenv";
import { electron } from "./scripts/vite-plugin-electron";
import {
    configPath,
    typesEntryPath,
    i18nEntryPath,
    componentsEntryPath,
    rootNodeModules,
    rendererPath,
} from "../../scripts/constants";

export default defineConfig(() => {
    const plugins = [
        refresh(),
        dotenv(configPath),
        electron(),
        eslintPlugin(),
        copy({
            targets: [
                /**
                 * e.g:
                 * /Users/black-hole/Code/Job/Agora/flat/node_modules/monaco-editor/min/vs
                 * to
                 * /Users/black-hole/Code/Job/Agora/flat/desktop/renderer-app/dist/monaco-editor/min/vs
                 */
                {
                    src: path.join(rootNodeModules, "monaco-editor", "min", "vs"),
                    // don't write "vs". because dist path will is: dist/monaco-editor/min/vs/vs
                    dest: path.join(rendererPath, "dist", "monaco-editor", "min"),
                },
                {
                    src: path.join(rootNodeModules, "monaco-editor", "min-maps", "vs"),
                    dest: path.join(rendererPath, "dist", "monaco-editor", "min-maps"),
                },
            ],
            // see: https://github.com/vitejs/vite/issues/1231#issuecomment-753549857
            hook: "writeBundle",
        }),
    ];
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
            postcss: {
                plugins: [
                    {
                        // see: https://github.com/vitejs/vite/issues/5833
                        // don't worry about causing any side effects, see: https://developer.mozilla.org/en-US/docs/Web/CSS/@charset
                        postcssPlugin: "internal:charset-removal",
                        AtRule: {
                            charset: atRule => {
                                if (atRule.name === "charset") {
                                    atRule.remove();
                                }
                            },
                        },
                    },
                ],
            },
        },
    };
});
