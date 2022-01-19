import { initRegisterApps } from "./init-register-apps";
import { initServiceWork } from "./init-service-works";
import { initUI } from "./init-ui";
import { initWhiteSDK } from "./init-white-sdk";

export const tasks = [initServiceWork, initWhiteSDK, initUI, initRegisterApps];
