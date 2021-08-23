const fs = require("fs");
const path = require("path");

const rootPackageJSONPath = path.resolve(__dirname, "..", "..", "package.json");

/**
 * @type { typeof import("../../package.json") }
 */
const packageJSONContent = require(rootPackageJSONPath);

for (const scriptName in packageJSONContent.scripts) {
    if (scriptName.startsWith("pre") || scriptName.startsWith("post")) {
        delete packageJSONContent.scripts[scriptName];
    }
}

fs.writeFileSync(rootPackageJSONPath, JSON.stringify(packageJSONContent, null, 2), {
    encoding: "utf-8",
});
