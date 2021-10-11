import { initRegisterApps } from "./init-register-apps";
import { initServiceWork } from "./init-service-works";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";

export const tasks = [initServiceWork, initWhiteSDK, initUI, initRegisterApps];
