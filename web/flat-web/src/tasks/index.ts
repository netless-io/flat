import { initRegisterApps } from "./init-register-apps";
import { initServiceWork } from "./init-service-works";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initFlatRTC } from "../services/flat-rtc";

export const tasks = [initServiceWork, initFlatRTC, initWhiteSDK, initUI, initRegisterApps];
