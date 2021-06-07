const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const { rootPath, rootPackageJSONPath, packagesPath } = require("../constants");

// Set commands context to project root
shell.cd(rootPath);

const packages = (() => {
    // if the current environment is CI, the package to be compiled is selected by reading the workspaces.packages information under package.json.
    // because in a CI environment, we will first call the install-changed-package-dependencies.js script to selectively install which package dependencies
    if (process.env.CI) {
        const rootPackageJSON = require(rootPackageJSONPath);
        const prefixPath = "packages/";

        // ["packages/flat-type", "desktop/main-app"] => ["flat-type"]
        return rootPackageJSON.workspaces.packages
            .filter(packagePath => packagePath.startsWith(prefixPath))
            .map(packagePath => packagePath.slice(prefixPath.length));
    }

    return fs.readdirSync(packagesPath).filter(name => !name.startsWith("."));
})();

for (const packageName of packages) {
    const pkgPath = path.join(packagesPath, packageName);
    const pkgJSONPath = path.join(pkgPath, "package.json");

    if (fs.existsSync(pkgJSONPath)) {
        const pkgJSON = require(pkgJSONPath);

        // some packages may not have build command
        if (pkgJSON && pkgJSON.scripts && pkgJSON.scripts.build) {
            console.log(`\nbuilding "/packages/${packageName}"\n`);

            const buildExitCode = shell.exec(`yarn --cwd "${pkgPath}" build`).code;
            if (buildExitCode !== 0) {
                shell.exit(buildExitCode);
            }
        }
    }
}
