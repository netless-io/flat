import { build, OutputFile } from "esbuild";
import { readFileSync } from "fs";
import { join } from "path";

// e.g:
// flat/node_modules/electron/index.js?v=19cea64f => flat/node_modules/electron/index.js
const removeQueryString = (url: string): string => url.replace(/\?.*$/s, "").replace(/#.*$/s, "");

const bundleModel = (filePath: string): Promise<OutputFile[]> => {
    return build({
        entryPoints: [filePath],
        bundle: true,
        outfile: "index.js",
        platform: "node",
        write: false,
    })
        .then(({ outputFiles }) => outputFiles)
        .catch(error => {
            console.error(error);
            return [];
        });
};

export const cjs2esm = async (
    id: string,
    entries: Array<{ entryPoints: string; code: string; shouldBundle: boolean }>,
): Promise<string | null> => {
    const filePath = removeQueryString(id);

    for (const { entryPoints, code, shouldBundle } of entries) {
        if (!filePath.endsWith(entryPoints)) {
            continue;
        }

        if (!shouldBundle) {
            return code;
        }

        const outputFiles = await bundleModel(filePath);
        if (outputFiles.length === 0) {
            return code;
        }

        return outputFiles
            .map(({ text }) => text)
            .join("")
            .concat(code);
    }
    return null;
};

export function getTemplate(path: string): string {
    return readFileSync(join(__dirname, path), "utf8");
}
