const semver = require("semver")
const current = require('../desktop/main-app/package.json').version

const next = process.argv[2];
if (!next) {
    console.log("usage: node scripts/changelog.js", semver.inc(current, "patch"));
    process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const log = require("child_process").execSync('git log --pretty=format:"%h:%H %s" $(git describe --tags --abbrev=0 @^)..@', { encoding: "utf-8" });
const features = []
const fixes = []
const perf = []
log.trimEnd().split("\n").forEach(line => {
    const match = line.match(/^(\w+):(\w+) (\w+)\(([^\)]+)\): (.+)/)
    if (match === null) return;
    const abbr = match[1];
    const commit = match[2];
    const type = match[3];
    const scope = match[4];
    const message = match[5].replace(/\#(\d+)/, "[#$1](https://github.com/netless-io/flat/issues/$1)");
    const item = `* **${scope}**: ${message} ([${abbr}](https://github.com/netless-io/flat/commit/${abbr}))`;
    if (type === "feat") features.push(item);
    if (type === "fix") fixes.push(item);
    if (type === "perf") perf.push(item);
});

let result = `## [${next}](https://github.com/netless-io/flat/compare/v${current}...v${next}) (${today})

`;

if (features.length > 0) {
    result += `
### Features

${features.join("\n")}
`;
}

if (fixes.length > 0) {
    result += `
### Bug Fixes

${fixes.join("\n")}
`;
}

if (perf.length > 0) {
    result += `
### Performance Improvements

${perf.join("\n")}
`;
}

console.log(result);
