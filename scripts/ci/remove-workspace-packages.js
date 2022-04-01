const fs = require("fs");
const { workspacePath } = require("../constants");

const content = {};

const retentionPackageName = process.argv[2];

switch (retentionPackageName) {
    case "desktop": {
        content.workspaces = ["desktop/**", "packages/**"];
        break;
    }
    case "web": {
        content.workspaces = ["web/**", "packages/**"];
        break;
    }
    default: {
        throw new Error("need retention package name not found, only supports: desktop / web");
    }
}

const text = `workspaces:\n  - ${content.workspaces.join("\n  - ")}`;

fs.writeFileSync(workspacePath, text, {
    encoding: "utf-8",
});
