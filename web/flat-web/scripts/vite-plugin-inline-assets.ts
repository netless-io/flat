import type { Plugin } from "vite";
import { promises as fsp } from "fs";
import mime from "mime/lite";
import svgToTinyDataUri from "@netless/mini-svg-data-uri";

// e.g:
// flat/node_modules/electron/index.js?v=19cea64f => flat/node_modules/electron/index.js
const removeQueryString = (url: string): string => url.replace(/#.*$/, "").replace(/\?.*$/, "");

export function inlineAssets(): Plugin {
    return {
        name: "inline:assets",
        enforce: "pre",
        async transform(_, id: string) {
            const filePath = cleanUrl(id);
            if (/\.(svg|jpg|jpeg|png|gif)$/i.test(filePath)) {
                const imageFileContent = await fsp.readFile(filePath);
                const url = filePath.endsWith(".svg")
                    ? svgToTinyDataUri(imageFileContent.toString("utf-8"), "utf8")
                    : `data:${mime.getType(filePath)};base64,${imageFileContent.toString(
                        "base64",
                    )}`;
                return `const content = "${url}";export default content;`;
            }
            return null;
        },
    };
}
