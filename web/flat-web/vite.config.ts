import legacy from "@vitejs/plugin-legacy";
import refresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import { dotenv } from "./scripts/vite-plugin-dotenv";
import { injectHtmlHash } from "./scripts/vite-plugin-html-hash";
import { version } from "./scripts/vite-plugin-version";
import { inlineAssets } from "./scripts/vite-plugin-inline-assets";
import {
    configPath,
    typesEntryPath,
    i18nEntryPath,
    componentsEntryPath,
    mainPackageJSONPath,
} from "../../scripts/constants";

export default defineConfig({
    plugins: [
        refresh(),
        legacy(),
        dotenv(configPath),
        injectHtmlHash(),
        version(mainPackageJSONPath),
        inlineAssets(),
    ],
    resolve: {
        alias: [
            // replace webpack alias
            { find: /^~/, replacement: "" },
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
