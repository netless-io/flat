import { autoChooseConfig } from "../../../../scripts/utils/auto-choose-config";
import pkg from "../../package.json";
import dotEnvFlowPlugin from "./plugin/dotEnvFlowPlugin";

export const external = Object.keys(pkg.dependencies);

export const dotenvPlugin = dotEnvFlowPlugin({
    path: autoChooseConfig(),
    system_vars: true,
    default_node_env: "development",
    silent: true,
});
