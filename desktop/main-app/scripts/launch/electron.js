const path = require("path");
const nodemon = require("nodemon");
const { mainPath } = require("../../../../scripts/constants");

const distPath = path.resolve(mainPath, "dist", "main.js");

nodemon(`nodemon --watch ${distPath} --exec "electron ${distPath}"`).on("quit", () => {
    process.exit();
});
