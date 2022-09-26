import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { dotenv } from "@netless/flat-vite-plugins/dotenv";
import { reactVirtualized } from "@netless/flat-vite-plugins/react-virtualized";
import { injectHtmlHash } from "./scripts/vite-plugin-html-hash";
import { version } from "./scripts/vite-plugin-version";
import { inlineAssets } from "./scripts/vite-plugin-inline-assets";
import { mainPackageJSONPath } from "../../scripts/constants";
import { autoChooseConfig } from "../../scripts/utils/auto-choose-config";
import viteCompression from "vite-plugin-compression";

// HACK: disable dedupe in the react plugin
const reactPlugin = react();
{
    const p = (reactPlugin as any).find((e: any) => e?.name === "vite:react-refresh");
    // This line overrides the original config (dedupe)
    p.config = () => ({ esbuild: { target: "esnext" } });
}

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        reactPlugin,
        dotenv(autoChooseConfig()),
        injectHtmlHash(),
        version(mainPackageJSONPath),
        inlineAssets(),
        reactVirtualized(),
        viteCompression({ filter: /\.(js)$/i }),
    ],
    resolve: {
        alias: [
            // replace webpack alias
            { find: /^~/, replacement: "" },
        ],
    },
    build: {
        sourcemap: true,
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
});
