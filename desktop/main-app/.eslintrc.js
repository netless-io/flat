const path = require("path");

module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@netless", "prettier", "@typescript-eslint"],
    parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
        ecmaVersion: 7,
        sourceType: "module",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@netless/recommended",
        "plugin:prettier/recommended",
    ],
    rules: {
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array",
            },
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                accessibility: "explicit",
                overrides: {
                    accessors: "explicit",
                    constructors: "explicit",
                },
            },
        ],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                multiline: {
                    delimiter: "semi",
                    requireLast: true,
                },
                singleline: {
                    delimiter: "semi",
                    requireLast: false,
                },
            },
        ],
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/type-annotation-spacing": "error",
        "arrow-parens": ["error", "as-needed"],
        "brace-style": ["error", "1tbs"],
        "comma-dangle": ["error", "always-multiline"],
        curly: "error",
        eqeqeq: ["error", "always"],
        "no-eval": "error",
        "no-invalid-this": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-unsafe-finally": "error",
        "prefer-const": "error",
        "spaced-comment": [
            "error",
            "always",
            {
                markers: ["/"],
            },
        ],
        "use-isnan": "error",
        "no-var": "error", // Disable var
        semi: [
            // Always use semi
            "error",
            "always",
        ],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "prettier/prettier": "error",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
    },
};
