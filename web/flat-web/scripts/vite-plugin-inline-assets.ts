import type { Plugin } from "vite";
import { promises as fsp } from "fs";
import { lookup } from "mrmime";
import svgToTinyDataUri from "@netless/mini-svg-data-uri";

// e.g:
// flat/node_modules/electron/index.js?v=19cea64f => flat/node_modules/electron/index.js
const cleanUrl = (url: string): string => url.replace(/[?#].*$/, "");

export function inlineAssets(): Plugin {
    return {
        name: "flat:inline-assets",
        enforce: "pre",
        async load(id) {
            id = cleanUrl(id);
            if (/\.(svg|jpg|jpeg|png|gif)$/i.test(id)) {
                const content = await fsp.readFile(id);
                const url = id.endsWith(".svg")
                    ? svgToTinyDataUri(content.toString("utf-8"), "utf8")
                    : `data:${lookup(id)};base64,${content.toString("base64")}`;
                return `export default ${JSON.stringify(url)};`;
            }
            return null;
        },
    };
}
