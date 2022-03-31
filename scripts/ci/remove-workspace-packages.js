const fs = require("fs");
const yaml = require("yaml");
const { workspacePath } = require("../constants");

const content = yaml.parse(fs.readFileSync(workspacePath, "utf8"));

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

fs.writeFileSync(workspacePath, yaml.stringify(content), {
    encoding: "utf-8",
});
