const fs = require("fs");
const path = require("path");

const rootPackageJSONPath = path.resolve(__dirname, "..", "..", "package.json");

/**
 * @type { typeof import("../../package.json") }
 */
const packageJSONContent = require(rootPackageJSONPath);

const retentionPackageName = process.argv[2];

switch (retentionPackageName) {
    case "desktop": {
        packageJSONContent.workspaces.packages = ["desktop/*", "packages/*"];
        break;
    }
    case "web": {
        packageJSONContent.workspaces.packages = ["web/*", "packages/*"];
        break;
    }
    default: {
        throw new Error("need retention package name not found, only supports: desktop / web");
    }
}

fs.writeFileSync(rootPackageJSONPath, JSON.stringify(packageJSONContent, null, 2), {
    encoding: "utf-8",
});
