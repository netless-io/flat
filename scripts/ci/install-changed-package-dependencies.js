if (!process.env.CI) {
    process.exit();
}

const fs = require("fs");
const { workspacePath } = require("../constants");

const { components, types, renderer, main, flatWeb } = process.env;

const isTrue = v => v === "true";

let packages = [];

if (isTrue(types)) {
    packages.push("packages/flat-types");
}

if (isTrue(components)) {
    packages.push("packages/flat-i18n", "packages/flat-types", "packages/flat-components");
}

if (isTrue(renderer)) {
    packages.push(
        "packages/flat-i18n",
        "packages/flat-types",
        "packages/flat-components",
        "desktop/renderer-app",
    );
}

if (isTrue(main)) {
    packages.push("packages/flat-types", "desktop/main-app");
}

if (isTrue(flatWeb)) {
    packages.push(
        "packages/flat-i18n",
        "packages/flat-types",
        "packages/flat-components",
        "web/flat-web",
    );
}

packages = Array.from(new Set(packages));

// if there are no changes, there is no need to install any dependencies
if (packages.length === 0) {
    console.log("no changed, no need install dependencies");
    process.exit(1);
}

console.log(`will install dependencies in: ${packages.join(", ")}`);

const content = { packages };

const text = `packages:\n  - ${content.packages.join("\n  - ")}`;

fs.writeFileSync(workspacePath, text, {
    encoding: "utf-8",
});
