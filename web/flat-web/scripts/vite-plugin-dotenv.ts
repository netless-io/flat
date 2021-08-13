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
            const envConfigContent = getEnvConfigContent(envDir, mode);

            if (envConfigContent) {
                const parsed = dotenvReal.parse(envConfigContent);
                dotenvExpand({ parsed });
                const env = { ...parsed };
                const define: Record<string, string | {}> = {};
                for (const [key, value] of Object.entries(env)) {
                    define[`import.meta.env.${key}`] = JSON.stringify(value);
                }
                config.define = { ...config.define, ...define };
            }
        },
    };
}

const getEnvConfigContent = (envDir: string, mode: string): string | null => {
    const configFileList = [
        path.join(envDir, `.env.${mode}.local`),
        path.join(envDir, `.env.${mode}`),
    ];

    for (const filepath of configFileList) {
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            return fs.readFileSync(filepath, "utf-8");
        }
    }

    return null;
};
