const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const storybookPath = path.join(__dirname, "..", "storybook-static");
shell.cd(storybookPath);

const artifacts = fs.readdirSync(storybookPath);

shell.mkdir("storybook");

for (const name of artifacts) {
    shell.mv(name, "storybook");
}

fs.writeFileSync(
    path.join(storybookPath, "index.html"),
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title> Flat Storybook </title>
  <meta http-equiv="refresh" content="0; url=/flat/storybook/">
  <link rel="canonical" href="/flat/storybook/" />
</head>
<body>
</body>
</html>
`,
);

shell.exec("git init");
shell.exec("git add -A");
shell.exec('git commit -m "deploy"');
shell.exec("git push -f git@github.com:netless-io/flat.git master:gh-pages");
