import fs from "fs";
import path from "path";
import dotenvReal from "dotenv";
import dotenvExpand from "dotenv-expand";
import type { Plugin } from "vite";

// based on https://github.com/IndexXuan/vite-plugin-env-compatible
export function dotenv(envDir: string = process.cwd()): Plugin {
    return {
        name: "flat:dotenv",
        enforce: "pre",
        config(config, { mode }) {
            const targetFile = path.join(envDir, `.env.${mode}.local`);
            if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
                const parsed = dotenvReal.parse(fs.readFileSync(targetFile));
                dotenvExpand({ parsed });
                const env = { ...parsed };
                const define: Record<string, string | {}> = {};
                for (const [key, value] of Object.entries(env)) {
                    define[`import.meta.env.${key}`] = JSON.stringify(value);
                }
                config.define = { ...config.define, ...define };
            } else {
                throw new Error("cannot found env file" + targetFile);
            }
        },
    };
}
