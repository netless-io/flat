/**
 * only keep the project in the packages directory, because they are not needed to deploy storybook. If not removed, a lot of unnecessary libraries will be installed
 */

if (!process.env.CI) {
    return;
}

const fs = require("fs");
const path = require("path");

const packageJSONFileContent = require("../../../package.json");

packageJSONFileContent.workspaces.packages = ["packages/*"];

const newFileContent = JSON.stringify(packageJSONFileContent, null, 2);

const packageJSONFilePath = path.join(__dirname, "..", "..", "..", "package.json");

fs.writeFileSync(packageJSONFilePath, newFileContent, {
    encoding: "utf-8",
});
