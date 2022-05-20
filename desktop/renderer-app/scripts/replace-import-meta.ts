import { Plugin } from "esbuild";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

// from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L904
export default function replaceImportMeta(): Plugin {
    return {
        name: "replace-import-meta",
        setup(build) {
            build.onLoad({ filter: /\.[jt]s$/ }, async args => {
                const contents = await fs.promises.readFile(args.path, "utf8");
                return {
                    loader: args.path.endsWith(".ts") ? "ts" : "js",
                    contents: contents
                        .replace(
                            /\bimport\.meta\.url\b/g,
                            JSON.stringify(pathToFileURL(args.path).href),
                        )
                        .replace(/\b__dirname\b/g, JSON.stringify(path.dirname(args.path)))
                        .replace(/\b__filename\b/g, JSON.stringify(args.path)),
                };
            });
        },
    };
}
