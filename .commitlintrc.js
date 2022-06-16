module.exports = {
    extends: ["@commitlint/config-angular"],
    rules: {
        "header-max-length": [2, "always", 100],
        "header-min-length": [2, "always", 12],
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "revert",
                "style",
                "test",
            ],
        ],
        "scope-empty": [2, "never"],
        "scope-enum": [
            2,
            "always",
            [
                "ci",
                "cloud-storage",
                "desktop",
                "deployment",
                "electron",
                "env",
                "agora",
                "whiteboard",
                "component",
                "storybook",
                "flat-components",
                "flat-types",
                "web",
                "i18n",
                "renderer-app",
                "main-app",
                "version",
                "library",
                "scripts",
                "readme",
                "changelog",
                "eslint",
                "prettier",
                "husky",
                "lint",
                "project",
                "ide",
                "license",
                "debug",
                "github",
                "style",
                "room",
                "classroom",
                "assets",
                "login",
                "config",
                "flat-rtc",
                "pnpm",
                "server",
            ],
        ],
        "scope-case": [2, "always", ["lower-case", "kebab-case"]],
    },
};
