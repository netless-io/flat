module.exports = api => {
    api.cache.using(() => process.env.NODE_ENV);
    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false,
                },
            ],
            ["@babel/preset-react"],
            ["@babel/preset-typescript"],
        ],
        plugins: [
            "@babel/plugin-transform-runtime",
            [
                "@babel/plugin-proposal-class-properties",
                {
                    loose: true,
                },
            ],
            !api.env("production") && "react-refresh/babel",
        ].filter(Boolean),
    };
};
