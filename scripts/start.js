const { spawnSync } = require("child_process");

function system(cmd) {
    spawnSync(cmd, { stdio: "inherit", shell: true });
}

if (process.platform === "win32") {
    system("yarn start:win");
} else if (process.platform === "darwin") {
    system("yarn start:mac");
}
