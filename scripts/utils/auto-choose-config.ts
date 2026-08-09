const { configPath } = require("../constants");
const path = require("path");

const configRegion = (): string => {
    return process.env.FLAT_REGION || "CN";
};

const autoChooseConfig = (): string => {
    return path.join(configPath, configRegion());
};

module.exports.configRegion = configRegion;
module.exports.autoChooseConfig = autoChooseConfig;

export {};
