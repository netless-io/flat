import { initEnv } from "./init-env";
import { initRegisterApps } from "./init-register-apps";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initURLProtocol } from "./init-url-protocol";
import { initFlatRTC } from "../services/flat-rtc";

const tasks = [initEnv, initURLProtocol, initFlatRTC, initWhiteSDK, initUI, initRegisterApps];

export default tasks;
