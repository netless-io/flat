const path = require("path");
const nodemon = require("nodemon");

const distPath = path.resolve(__dirname, "..", "dist", "main", "main.js");

nodemon(`nodemon --watch ${distPath} --exec "electron ${distPath}"`).on("quit", () => {
    process.exit();
});
