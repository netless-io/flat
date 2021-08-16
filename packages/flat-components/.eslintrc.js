module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "react-app",
        "plugin:jsx-a11y/recommended",
        "plugin:@netless/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: ["jsx-a11y", "react", "@netless", "prettier", "@typescript-eslint"],
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: 7,
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        // http://eslint.org/docs/rules/
        "array-callback-return": "warn",
        "default-case": ["warn", { commentPattern: "^no default$" }],
        "dot-location": ["warn", "property"],
        eqeqeq: ["error", "always"],
        "new-parens": "warn",
        "no-array-constructor": "warn",
        "no-caller": "warn",
        "no-cond-assign": ["warn", "except-parens"],
        "no-const-assign": "warn",
        "no-control-regex": "warn",
        "no-delete-var": "warn",
        "no-dupe-args": "warn",
        // support typescript overload
        // typescript does its own check
        "no-dupe-class-members": "off",
        "no-dupe-keys": "warn",
        "no-duplicate-case": "warn",
        "no-empty-character-class": "warn",
        "no-empty-pattern": "warn",
        "no-eval": "warn",
        "no-ex-assign": "warn",
        "no-extend-native": "warn",
        "no-extra-bind": "warn",
        "no-extra-label": "warn",
        "no-fallthrough": "warn",
        "no-func-assign": "warn",
        "no-implied-eval": "warn",
        "no-invalid-regexp": "warn",
        "no-iterator": "warn",
        "no-label-var": "warn",
        "no-labels": ["warn", { allowLoop: true, allowSwitch: false }],
        "no-lone-blocks": "warn",
        "no-loop-func": "warn",
        "no-mixed-operators": [
            "warn",
            {
                groups: [
                    ["&", "|", "^", "~", "<<", ">>", ">>>"],
                    ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
                    ["&&", "||"],
                    ["in", "instanceof"],
                ],
                allowSamePrecedence: false,
            },
        ],
        "no-multi-str": "warn",
        "no-native-reassign": "warn",
        "no-negated-in-lhs": "warn",
        "no-new-func": "warn",
        "no-new-object": "warn",
        "no-new-symbol": "warn",
        "no-new-wrappers": "warn",
        "no-obj-calls": "warn",
        "no-octal": "warn",
        "no-octal-escape": "warn",
        // TODO: Remove this option in the next major release of CRA.
        // https://eslint.org/docs/user-guide/migrating-to-6.0.0#-the-no-redeclare-rule-is-now-more-strict-by-default
        "no-redeclare": ["warn", { builtinGlobals: false }],
        "no-regex-spaces": "warn",
        "no-restricted-syntax": ["warn", "WithStatement"],
        "no-script-url": "warn",
        "no-self-assign": "warn",
        "no-self-compare": "warn",
        "no-sequences": "warn",
        "no-shadow-restricted-names": "warn",
        "no-sparse-arrays": "warn",
        "no-template-curly-in-string": "warn",
        "no-this-before-super": "warn",
        "no-throw-literal": "warn",
        "no-undef": "error",
        "no-unreachable": "warn",
        "no-unused-expressions": [
            "error",
            {
                allowShortCircuit: true,
                allowTernary: true,
                allowTaggedTemplates: true,
            },
        ],
        "no-unused-labels": "warn",
        "no-unused-vars": "off",
        "no-useless-computed-key": "warn",
        "no-useless-concat": "warn",
        "no-useless-constructor": "warn",
        "no-useless-escape": "warn",
        "no-useless-rename": [
            "warn",
            {
                ignoreDestructuring: false,
                ignoreImport: false,
                ignoreExport: false,
            },
        ],
        "no-with": "warn",
        "no-whitespace-before-property": "warn",
        "react-hooks/exhaustive-deps": "warn",
        "require-yield": "warn",
        "rest-spread-spacing": ["warn", "never"],
        strict: ["warn", "never"],
        "unicode-bom": ["warn", "never"],
        "use-isnan": "warn",
        "valid-typeof": "warn",
        "no-restricted-properties": [
            "error",
            {
                object: "require",
                property: "ensure",
                message:
                    "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting",
            },
            {
                object: "System",
                property: "import",
                message:
                    "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting",
            },
        ],
        "getter-return": "warn",

        // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
        "import/first": "error",
        "import/no-amd": "error",
        "import/no-anonymous-default-export": "warn",
        "import/no-webpack-loader-syntax": "error",

        // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
        "react/forbid-foreign-prop-types": ["warn", { allowInPropTypes: true }],
        "react/jsx-no-comment-textnodes": "warn",
        "react/jsx-no-duplicate-props": "warn",
        "react/jsx-no-target-blank": "warn",
        "react/jsx-no-undef": "error",
        "react/jsx-pascal-case": [
            "warn",
            {
                allowAllCaps: true,
                ignore: [],
            },
        ],
        "react/jsx-uses-react": "warn",
        "react/jsx-uses-vars": "warn",
        "react/no-danger-with-children": "warn",
        // Disabled because of undesirable warnings
        // See https://github.com/facebook/create-react-app/issues/5204 for
        // blockers until its re-enabled
        // 'react/no-deprecated': 'warn',
        "react/no-direct-mutation-state": "warn",
        "react/no-is-mounted": "warn",
        "react/no-typos": "error",
        "react/react-in-jsx-scope": "error",
        "react/require-render-return": "error",
        "react/style-prop-object": "warn",

        // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
        "jsx-a11y/alt-text": "off",
        "jsx-a11y/anchor-has-content": "warn",
        "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
        "jsx-a11y/aria-props": "warn",
        "jsx-a11y/aria-proptypes": "warn",
        "jsx-a11y/aria-role": ["warn", { ignoreNonDOM: true }],
        "jsx-a11y/aria-unsupported-elements": "warn",
        "jsx-a11y/heading-has-content": "warn",
        "jsx-a11y/iframe-has-title": "warn",
        "jsx-a11y/img-redundant-alt": "warn",
        "jsx-a11y/no-access-key": "warn",
        "jsx-a11y/no-distracting-elements": "warn",
        "jsx-a11y/no-redundant-roles": "warn",
        "jsx-a11y/role-has-required-aria-props": "warn",
        "jsx-a11y/role-supports-aria-props": "warn",
        "jsx-a11y/scope": "warn",
        "jsx-a11y/media-has-caption": "off",
        "jsx-a11y/anchor-is-valid": "off",

        // https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks
        "react-hooks/rules-of-hooks": "error",

        // https://github.com/gajus/eslint-plugin-flowtype
        "flowtype/define-flow-type": "warn",
        "flowtype/require-valid-file-annotation": "warn",
        "flowtype/use-flow-type": "warn",

        // custom
        "react/jsx-key": "off",
        "react/prop-types": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "jsx-a11y/mouse-events-have-key-events": "off",
        "@typescript-eslint/no-redeclare": "off",
        "no-use-before-define": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array-simple",
                readonly: "array-simple",
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
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
    },

    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ["*.ts", "*.tsx"],
            globals: {
                JSX: true,
            },
            rules: {
                "@typescript-eslint/explicit-function-return-type": [
                    "error",
                    {
                        allowExpressions: true,
                        allowTypedFunctionExpressions: true,
                        allowHigherOrderFunctions: true,
                        allowDirectConstAssertionInArrowFunctions: true,
                        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                    },
                ],
            },
        },
    ],
};
