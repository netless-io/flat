const fs = require("fs");
const path = require("path");
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    {
      name: "@storybook/preset-create-react-app",
      options: {
        craOverrides: {
          fileLoaderExcludes: ["less"],
        }
      }
    },
    "storybook-react-i18next",
    "@storybook/addon-viewport",
  ],
  "webpackFinal": (config) => {
    config.module.rules.unshift({
      test: /\.less$/,
      sideEffects: true,
      use: [
        {
          loader: "style-loader",
        },
        {
          loader: "css-loader",
        },
        {
              loader: "less-loader",
              options: {
                  lessOptions: {
                      javascriptEnabled: true,
                  },
              },
          },
      ],
    });

    return config;
  }
}