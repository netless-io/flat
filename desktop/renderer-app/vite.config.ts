import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption, UserConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import copy from "rollup-plugin-copy";
import path from "path";

import { dotenv } from "@netless/flat-vite-plugins/dotenv";
import { reactVirtualized } from "@netless/flat-vite-plugins/react-virtualized";
import { electron } from "./scripts/vite-plugin-electron";
import { injectGtag } from "./scripts/vite-plugin-html-gtag";
import { rootNodeModules, rendererPath } from "../../scripts/constants";
import { autoChooseConfig } from "../../scripts/utils/auto-choose-config";

// HACK: disable dedupe in the react plugin
// We need to do this because Flat is not a typical react project,
// the 'white-web-sdk' has a dependency of react@16 while Flat is using react@17,
// they cannot be de-deduplicated because 'white-web-sdk' heavily uses the react@16 internal APIs.
const reactPlugin = react();
{
    const p = (reactPlugin as any).find((e: any) => e?.name === "vite:react-refresh");
    // This line overrides the original config (dedupe)
    // See https://github.com/vitejs/vite/blob/87b48f9103f467c3ad33b039ccf845aed9a281d7/packages/plugin-react/src/index.ts#L379
    p.config = () => ({ esbuild: { target: "esnext" } });
}

export default defineConfig((): UserConfig => {
    const plugins: PluginOption[] = [
        reactPlugin,
        dotenv(autoChooseConfig()),
        reactVirtualized(),
        injectGtag(),
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
        server: {
            port: 3000,
        },
        plugins,
        resolve: {
            alias: [
                // replace webpack alias
                { find: /^~/, replacement: "" },
            ],
        },
        assetsInclude: ["svga"],
        build: {
            sourcemap: true,
            emptyOutDir: true,
            /**
             * Vite will generate resources in assets folder after build，
             * but index.html with './' relative path load module,
             * instead of the default 'assets' folder.
             */
            assetsDir: "",
            rollupOptions: {
                output: {
                    assetFileNames: assetInfo => {
                        if (assetInfo.name?.endsWith("mp3")) {
                            return "[name][extname]";
                        }
                        return "[name]-[hash][extname]";
                    },
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
