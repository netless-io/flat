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
            const json = JSON.parse(content) as { applinks: { details: { appID: string }[] } };

            json.applinks.details.forEach(detail => {
                detail.appID = AppleAppID[region];
                console.log("Updated apple-app-site-association.json:", detail.appID);
            });

            // Append all appIds to allow universal links for different region apps.
            if (json.applinks.details.length > 0) {
                const keys = Object.keys(AppleAppID) as (keyof typeof AppleAppID)[];
                keys.forEach((key) => {
                    const appId = AppleAppID[key];
                    const appIdExist = json.applinks.details.some((detail) => detail.appID == appId);
                    if (!appIdExist) {
                        const appendingDetail = { ...json.applinks.details[0] };
                        appendingDetail.appID = appId;
                        json.applinks.details.push(appendingDetail);
                    }
                });
            }

            await writeFile(file, JSON.stringify(json, null, 2), "utf8");
        },
    };
}
