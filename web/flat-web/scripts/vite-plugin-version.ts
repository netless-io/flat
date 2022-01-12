import fs from "fs";
import type { Plugin } from "vite";

export function version(pkgPath: string): Plugin {
    return {
        name: "flat:dotenv",
        enforce: "pre",
        config(config) {
            if (fs.existsSync(pkgPath)) {
                const { version } = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
                config.define = {
                    ...config.define,
                    "process.env.VERSION": JSON.stringify(version),
                };
            }
        },
    };
}
