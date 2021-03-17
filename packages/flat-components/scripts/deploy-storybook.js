const shell = require("shelljs");
const path = require("path");

shell.cd(path.join(__dirname, "..", "storybook-static"));
shell.exec("git init");
shell.exec("git add -A");
shell.exec('git commit -m "deploy"');
shell.exec("git push -f git@github.com:netless-io/flat.git master:gh-pages");
