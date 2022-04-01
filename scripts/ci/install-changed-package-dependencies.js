if (!process.env.CI) {
    process.exit();
}

const fs = require("fs");
const { workspacePath } = require("../constants");

const { components, types, renderer, main, flatWeb } = process.env;

const isTrue = v => v === "true";

let workspaces = [];

if (isTrue(types)) {
    workspaces.push("packages/flat-types");
}

if (isTrue(components)) {
    workspaces.push("packages/flat-i18n", "packages/flat-types", "packages/flat-components");
}

if (isTrue(renderer)) {
    workspaces.push(
        "packages/flat-i18n",
        "packages/flat-types",
        "packages/flat-components",
        "desktop/renderer-app",
    );
}

if (isTrue(main)) {
    workspaces.push("packages/flat-types", "desktop/main-app");
}

if (isTrue(flatWeb)) {
    workspaces.push(
        "packages/flat-i18n",
        "packages/flat-types",
        "packages/flat-components",
        "web/flat-web",
    );
}

workspaces = Array.from(new Set(workspaces));

// if there are no changes, there is no need to install any dependencies
if (workspaces.length === 0) {
    console.log("no changed, no need install dependencies");
    process.exit(1);
}

console.log(`will install dependencies in: ${workspaces.join(", ")}`);

const content = { workspaces };

const text = `workspaces:\n  - ${content.workspaces.join("\n  - ")}`;

fs.writeFileSync(workspacePath, text, {
    encoding: "utf-8",
});
