import { initEnv } from "./Init-env";
import { initRegisterApps } from "./init-register-apps";
import { initUI } from "./Init-ui";
import { initURLProtocol } from "./init-URLProtocol";

const tasks = [initEnv, initURLProtocol, initUI, initRegisterApps];

export default tasks;
