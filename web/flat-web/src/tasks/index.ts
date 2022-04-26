import { initRegisterApps } from "./init-register-apps";
import { initServiceWork } from "./init-service-works";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initServices } from "../services";

export const tasks = [initServiceWork, initServices, initWhiteSDK, initUI, initRegisterApps];
