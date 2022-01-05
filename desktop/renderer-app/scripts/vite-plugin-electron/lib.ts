import { build } from "esbuild";
import { readFileSync } from "fs";
import { join } from "path";

const cleanUrl = (url: string): string => url.replace(/\?.*$/s, "").replace(/#.*$/s, "");

export const needParse = (
    id: string,
    entries: Array<{ entryPoints: string; code: string; shouldBundle: boolean }>,
): Promise<string | null> => {
    const cid = cleanUrl(id);
    let result: Promise<string | null> = Promise.resolve(null);
    for (const key of entries) {
        if (cid.endsWith(key.entryPoints)) {
            if (key.shouldBundle) {
                const path = id.replace(/(\?v=)(\w+)/g, "");
                result = build({
                    entryPoints: [path],
                    bundle: true,
                    outfile: "index.js",
                    platform: "node",
                    write: false,
                })
                    .then(result => {
                        return (
                            result?.outputFiles
                                ?.map(item => {
                                    return item.text;
                                })
                                .join("") ?? ""
                        );
                    })
                    .then(result => {
                        return result.concat(key.code);
                    })
                    .catch(e => {
                        console.warn(e);
                        return null;
                    });
            } else {
                return Promise.resolve(key.code);
            }
        }
    }
    return result;
};

export function getTemplate(path: string): string {
    return readFileSync(join(__dirname, path)).toString();
}
