import { initEnv } from "./init-env";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initURLProtocol } from "./init-url-protocol";
import { initFlatServices } from "./init-flat-services";
import { initRegionConfigs } from "./init-region-configs";

const tasks: Array<() => void | Promise<void>> = [
    initEnv,
    initURLProtocol,
    initRegionConfigs,
    initFlatServices,
    initWhiteSDK,
    initUI,
];

export default tasks;
