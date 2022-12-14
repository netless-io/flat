module.exports = {
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    arrowParens: "avoid",
    trailingComma: "all",
    bracketSpacing: true,
    endOfLine: "auto",
    quoteProps: "consistent",
    overrides: [
        {
            files: ["*.json", "*.yaml", "*.yml"],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
