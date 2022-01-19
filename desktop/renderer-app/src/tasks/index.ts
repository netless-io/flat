import { initEnv } from "./init-env";
import { initRegisterApps } from "./init-register-apps";
import { initUI } from "./init-ui";
import { initURLProtocol } from "./init-url-protocol";
import { initWaitRTC } from "./init-wait-rtc";
import { initWhiteSDK } from "./init-white-sdk";

const tasks = [initEnv, initURLProtocol, initWhiteSDK, initWaitRTC, initUI, initRegisterApps];

export default tasks;
