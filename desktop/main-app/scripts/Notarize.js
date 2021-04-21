const path = require("path");
const dotenvFlow = require("dotenv-flow");
const { notarize } = require("electron-notarize");

dotenvFlow.config({
    path: path.resolve(__dirname, "..", "..", "..", "config"),
    default_node_env: "production",
    silent: true,
});

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir, packager } = context;

    if (electronPlatformName !== "darwin") {
        return;
    }

    if (!process.env.APPLE_API_KEY || !process.env.APPLE_API_ISSUER) {
        return;
    }

    const appName = packager.appInfo.productFilename;
    const appBundleId = packager.config.appId;

    return await notarize({
        appBundleId,
        appPath: `${appOutDir}/${appName}.app`,
        appleApiKey: process.env.APPLE_API_KEY,
        appleApiIssuer: process.env.APPLE_API_ISSUER,
    });
};
