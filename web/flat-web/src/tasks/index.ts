import { initRegisterApps } from "./init-register-apps";
import { initServiceWork } from "./init-service-works";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initFlatServices } from "./init-flat-services";

export const tasks = [initServiceWork, initFlatServices, initWhiteSDK, initUI, initRegisterApps];
