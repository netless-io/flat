import { initEnv } from "./init-env";
import { initRegisterApps } from "./init-register-apps";
import { initWhiteSDK } from "./init-white-sdk";
import { initUI } from "./init-ui";
import { initURLProtocol } from "./init-url-protocol";
import { initFlatServices } from "./init-flat-services";

const tasks = [initEnv, initURLProtocol, initFlatServices, initWhiteSDK, initUI, initRegisterApps];

export default tasks;
