const path = require("path");
const fs = require("fs");
const shell = require("shelljs");

shell.cd(path.join(__dirname, ".."));

const packages = fs
    .readdirSync(path.join(__dirname, "..", "packages"))
    .filter(name => !name.startsWith("."));

for (const package of packages) {
    const pkgPath = path.join(__dirname, "..", "packages", package);
    const pkgJSONPath = path.join(pkgPath, "package.json");

    if (fs.existsSync(pkgJSONPath)) {
        const pkgJSON = require(pkgJSONPath);

        // some packages may not have build command
        if (pkgJSON && pkgJSON.scripts && pkgJSON.scripts.build) {
            console.log(`\nbuilding "/packages/${package}"\n`);

            if (shell.exec(`yarn --cwd "${pkgPath}" build`).code !== 0) {
                shell.exit(1);
            }
        }
    }
}
