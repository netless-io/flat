import { promises as fsp } from "fs";
import svgToTinyDataUri from "@netless/mini-svg-data-uri";
import mime from "mime/lite";
import { Plugin } from "vite";

// e.g:
// flat/node_modules/electron/index.js?v=19cea64f => flat/node_modules/electron/index.js
const cleanUrl = (url: string): string => url.replace(/[?#].*$/, "");

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
                return {
                    code: `const content = "${url}";export default content;`,
                    map: null,
                };
            }
            return null;
        },
    };
}
