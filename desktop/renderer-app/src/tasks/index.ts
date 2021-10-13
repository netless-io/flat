import { initEnv } from "./Init-env";
import { initRegisterApps } from "./init-register-apps";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./Init-ui";
import { initURLProtocol } from "./init-URLProtocol";

const tasks = [initEnv, initURLProtocol, initWhiteSDK, initUI, initRegisterApps];

export default tasks;
