const path = require("path");
const shell = require("shelljs");
const { rootPath, rootPackageJSONPath, packagesPath } = require("../constants");

// Set commands context to project root
shell.cd(rootPath);

const needBuildFlatComponents = () => {
    // if the current environment is CI, the package to be compiled is selected by reading the workspaces.packages information under package.json.
    // because in a CI environment, we will first call the install-changed-package-dependencies.js script to selectively install which package dependencies
    if (process.env.CI) {
        const rootPackageJSON = require(rootPackageJSONPath);

        return rootPackageJSON.workspaces.packages
            .some(packagePath => {
                return packagePath.indexOf("flat-components");
            });
    }

    return true;
}

if (needBuildFlatComponents) {
    console.log(`\nbuilding "/packages/flat-components"\n`);
    const buildExitCode = shell.exec(`yarn --cwd "${path.join(packagesPath, "flat-components")}" build`).code;

    if (buildExitCode !== 0) {
        shell.exit(buildExitCode);
    }
}
