import { Plugin } from "esbuild";
import fs from "fs";
import Less from "less";
import path from "path";
import { esbuildResolve } from "./esbuild-resolve";

const fs_cache = new Map<string, string>();
async function readFile(path: string) {
    let contents = fs_cache.get(path);
    if (contents === undefined) {
        contents = await fs.promises.readFile(path, "utf8");
        fs_cache.set(path, contents);
    }
    return contents;
}

class EsbuildResolver extends Less.FileManager {
    override supports() {
        return true;
    }
    override supportsSync() {
        return false;
    }
    override async loadFile(filename: string, dir: string, opts: any, env: any) {
        if (!filename.startsWith(".")) {
            filename = filename.replace(/^~\/?/, "");
            // try filename.less early so that we don't have to let esbuild do this work
            let maybeNear = path.join(dir, filename + ".less");
            let resolved: string | null = null;
            if (fs.existsSync(maybeNear)) {
                resolved = maybeNear;
            } else {
                resolved = await esbuildResolve(filename, dir);
            }
            if (resolved) {
                return {
                    filename: resolved,
                    contents: await readFile(resolved),
                };
            }
        }
        return super.loadFile(filename, dir, opts, env);
    }
}

// This plugin will take extra 2.2 seconds.
export default function less(): Plugin {
    return {
        name: "less",
        setup({ onLoad }) {
            onLoad({ filter: /\.less$/ }, async args => {
                let input = await readFile(args.path);
                let result = await Less.render(input, {
                    filename: args.path,
                    sourceMap: {
                        outputSourceFiles: true,
                        sourceMapFileInline: true,
                    },
                    javascriptEnabled: true,
                    plugins: [
                        {
                            install(_, pluginManager) {
                                pluginManager.addFileManager(new EsbuildResolver());
                            },
                            minVersion: [3, 0, 0],
                        },
                    ],
                });
                return { contents: result.css, loader: "css" };
            });
        },
    };
}
