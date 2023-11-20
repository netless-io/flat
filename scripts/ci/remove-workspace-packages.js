const fs = require("fs");
const { workspacePath } = require("../constants");

const content = {};

const retentionPackageName = process.argv[2];

switch (retentionPackageName) {
    case "desktop": {
        content.packages = ["desktop/**", "packages/**", "service-providers/**"];
        break;
    }
    case "web": {
        content.packages = ["web/**", "packages/**", "service-providers/**"];
        break;
    }
    default: {
        throw new Error("need retention package name not found, only supports: desktop / web");
    }
}

const text = `packages:\n  - ${content.packages.join("\n  - ")}`;

fs.writeFileSync(workspacePath, text, {
    encoding: "utf-8",
});
