import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import path from "path";
// TODO: find new place to store vite-plugin-dotenv
import { dotenv } from "../../web/flat-web/scripts/vite-plugin-dotenv";
import { visualizer } from "rollup-plugin-visualizer";
import { electron } from "./scripts/vite-plugin-electron";
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig(() => {
    const plugins = [refresh(), dotenv("../../config"), electron(), eslintPlugin()];
    if (process.env.ANALYZER) {
        plugins.push({
            ...visualizer(),
            enforce: "post",
            apply: "build",
        });
    }
    return {
        plugins,
        resolve: {
            alias: [
                // replace webpack alias
                { find: /^~/, replacement: "" },
                {
                    find: "flat-types",
                    replacement: path.join(__dirname, "..", "..", "packages", "flat-types", "src"),
                },
                {
                    find: "flat-i18n",
                    replacement: path.join(
                        __dirname,
                        "..",
                        "..",
                        "packages",
                        "flat-i18n",
                        "locales",
                    ),
                },
                {
                    find: "flat-components",
                    replacement: path.join(
                        __dirname,
                        "..",
                        "..",
                        "packages",
                        "flat-components",
                        "src",
                    ),
                },
            ],
        },
        build: {
            sourcemap: true,
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
