import { initEnv } from "./Init-env";
import { initUI } from "./Init-ui";
import { initURLProtocol } from "./init-URLProtocol";

const tasks = [initEnv, initURLProtocol, initUI];

export default tasks;
