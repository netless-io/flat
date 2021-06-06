const { spawnSync } = require("child_process");

function system(cmd) {
    spawnSync(cmd, { stdio: "inherit", shell: true });
}

if (process.platform === "win32") {
    system("scripts\\launch\\start.cmd");
} else if (process.platform === "darwin") {
    system("osascript ./scripts/launch/start.scpt");
}
