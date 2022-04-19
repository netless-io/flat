const { spawnSync } = require("child_process");

function system(cmd, printStdout = true) {
    return spawnSync(cmd, {
        stdio: printStdout ? "inherit" : "pipe",
        shell: true,
    });
}

function parseStdout({ stdout }) {
    return stdout.toString().trim();
}

const { FLAT_REGION } = process.env;
const suffix = FLAT_REGION ? ":" + FLAT_REGION.toLowerCase() : "";

if (process.platform === "win32") {
    system("scripts\\launch\\start.cmd " + suffix);
} else if (process.platform === "darwin") {
    const existsITerm2 = parseStdout(
        system("osascript ./scripts/launch/mac/exists_iTerm.scpt", false),
    );

    if (existsITerm2 === "true") {
        system("osascript ./scripts/launch/mac/launch_iTerm.scpt " + suffix);
    } else {
        system("osascript ./scripts/launch/mac/launch_terminal.scpt " + suffix);
    }
}
