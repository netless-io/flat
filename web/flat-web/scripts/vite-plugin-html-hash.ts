import { execSync } from "child_process";
import type { Plugin } from "vite";

export function injectHtmlHash(): Plugin {
    return {
        name: "flat:html-hash",
        enforce: "pre",
        transformIndexHtml: {
            enforce: "pre",
            transform(originalHTML) {
                const html = originalHTML.replace("FLAG_COMMIT_HASH", gitHash());

                return {
                    html,
                    tags: [],
                };
            },
        },
    };
}

// ensure that the commit hash is time-sensitive
// so using the function
const gitHash = (): string => {
    try {
        return execSync("git rev-parse HEAD", {
            encoding: "utf-8",
        }).trim();
    } catch {
        return "NOT_A_GIT_REPO";
    }
};
