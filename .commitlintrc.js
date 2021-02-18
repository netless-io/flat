module.exports = {
    extends: ["@commitlint/config-angular"],
    rules: {
        "header-max-length": [2, "always", 100],
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
    },
};
