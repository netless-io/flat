const path = require("path");
const fs = require("fs-extra");
const { rendererPath, mainPath } = require("../../../../scripts/constants");

const renderBuildPath = path.join(rendererPath, "dist");
const source = path.join(mainPath, "static", "render");
fs.copySync(renderBuildPath, source);
