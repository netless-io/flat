const { configRegion } = require("../../scripts/utils/auto-choose-config.js");
const dotenvReal = require("dotenv");
const { expand } = require("dotenv-expand");
const fs = require("fs");
const path = require("path");

// based on https://github.com/IndexXuan/vite-plugin-env-compatible
/**
 * @param {string} envDir
 * @return {import('vite').PluginOption}
 */
exports.dotenv = function dotenv(envDir) {
    return {
        name: "flat:dotenv",
        enforce: "pre",
        config(config, { mode }) {
            const envConfigContent = getEnvConfigContent(envDir, mode);
            const define = {};

            if (process.env["FLAT_UA"] !== undefined && process.env["FLAT_UA"] !== "undefined") {
                define["process.env.FLAT_UA"] = JSON.stringify(process.env["FLAT_UA"]);
            }

            if (envConfigContent) {
                const parsed = dotenvReal.parse(envConfigContent);
                expand({ parsed });
                const env = { ...parsed };

                for (const [key, value] of Object.entries(env)) {
                    define[`process.env.${key}`] = JSON.stringify(value);
                }

                define["process.env.PROD"] = mode === "production";
                define["process.env.DEV"] = mode === "development";
                define["process.env.NODE_DEV"] = JSON.stringify(mode);
                define["process.env.FLAT_REGION"] = JSON.stringify(configRegion());
            }

            config.define = { ...config.define, ...define };
        },
    };
};

const getEnvConfigContent = (envDir, mode) => {
    const configFileList = [
        path.join(envDir, `.env.${mode}.local`),
        path.join(envDir, `.env.${mode}`),
    ];

    for (const filepath of configFileList) {
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            return fs.readFileSync(filepath, "utf-8");
        }
    }

    return null;
};
