import type { Plugin, ResolvedConfig } from "vite";
import { existsSync, promises } from "fs";
import { resolve } from "path";

export function appleAppSiteAssociation(): Plugin {
    const AppleAppID = {
        CN: "48TB6ZZL5S.io.agora.flat",
        SG: "48TB6ZZL5S.io.agora.flint",
    };

    const { readFile, writeFile } = promises;

    let config: ResolvedConfig;

    return {
        name: "flat:apple-app-site-association",
        apply: "build",
        configResolved(config_) {
            config = config_;
        },
        async closeBundle() {
            const region = (process.env.FLAT_REGION as "CN" | "SG") || "CN";
            const file = resolve(config.build.outDir, "apple-app-site-association.json");

            if (!existsSync(file)) {
                console.warn("Not found apple-app-site-association.json.");
                return;
            }

            const content = await readFile(file, "utf8");
            const json = JSON.parse(content) as { applinks: { details: { appIDs: string[] }[] } };

            if (json.applinks.details.length > 0) {
                if (region === "CN") {
                    json.applinks.details[0].appIDs = [AppleAppID["CN"], AppleAppID["SG"]];
                } else if (region === "SG") {
                    json.applinks.details[0].appIDs = [AppleAppID["SG"], AppleAppID["CN"]];
                }
            }

            await writeFile(file, JSON.stringify(json, null, 2), "utf8");
        },
    };
}
