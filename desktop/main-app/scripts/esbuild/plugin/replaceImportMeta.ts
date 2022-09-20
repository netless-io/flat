import { Plugin } from "esbuild";
import { readFile } from "fs-extra";
import { dirname } from "path";
import { pathToFileURL } from "url";

export interface ReplaceImportMetaOptions {
    /**
     * Passed to `onLoad()`.
     * @default /\.[jt]s$/
     */
    filter?: RegExp;
}

/**
 * Replace `import.meta.url` and `__dirname`, `__filename` with absolute path.
 * Taken from https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts
 */
export function replaceImportMeta(options: ReplaceImportMetaOptions = {}): Plugin {
    const filter = options.filter ?? /\.[jt]s$/;

    return {
        name: "replace-import-meta",
        setup({ onLoad }) {
            onLoad({ filter }, async args => {
                const contents = await readFile(args.path, "utf8");
                const import_meta_url = JSON.stringify(pathToFileURL(args.path).href);
                return {
                    loader: "default",
                    contents: contents
                        .replace(/\bimport\.meta\.url\b/g, import_meta_url)
                        .replace(/\b__dirname\b/g, JSON.stringify(dirname(args.path)))
                        .replace(/\b__filename\b/g, JSON.stringify(args.path)),
                };
            });
        },
    };
}
