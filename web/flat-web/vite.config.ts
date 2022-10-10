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
