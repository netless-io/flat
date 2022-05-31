import { BuildOptions } from "esbuild";
import * as paths from "./paths";
import dotEnvFlowPlugin from "./plugin/dotEnvFlowPlugin";
import pkg from "../../package.json";
import { autoChooseConfig } from "../../../../scripts/utils/auto-choose-config";

const external = Object.keys(pkg.dependencies);

export const esbuildOption: BuildOptions & { incremental: true } = {
    entryPoints: [paths.entryFile],
    bundle: true,
    platform: "node",
    target: "node14",
    external: [...external, "electron"],
    sourcemap: true,
    incremental: true,
    outfile: paths.dist,
    watch: true,
    allowOverwrite: true,
    plugins: [
        dotEnvFlowPlugin({
            path: autoChooseConfig(),
            system_vars: true,
            default_node_env: "development",
        }),
    ],
};
