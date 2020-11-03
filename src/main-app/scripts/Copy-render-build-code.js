#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");

const renderBuildPath = path.join(__dirname, "..", "..", "renderer-app", "dist");
const source = path.join(__dirname, "..", "static", "render");
fs.copySync(renderBuildPath, source);
