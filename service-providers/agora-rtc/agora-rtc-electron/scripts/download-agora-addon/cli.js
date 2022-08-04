const { downloadAddon } = require("./core");

downloadAddon(process.platform === "win32" ? "win" : "mac");
