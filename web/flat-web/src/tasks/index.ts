import { initServiceWork } from "./init-service-works";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initRegionConfigs } from "./init-region-configs";
import { initFlatServices } from "./init-flat-services";

export const tasks: Array<() => void | Promise<void>> = [
    initServiceWork,
    initRegionConfigs,
    initFlatServices,
    initWhiteSDK,
    initUI,
];
