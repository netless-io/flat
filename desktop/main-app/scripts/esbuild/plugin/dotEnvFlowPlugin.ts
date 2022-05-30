import path from "path";
import fs from "fs";
import { Plugin, PluginBuild } from "esbuild";

// This plugin refer https://github.com/rw3iss/esbuild-envfile-plugin/blob/master/index.js, but has change to fit for dotEnvFlow

function findEnvFile(dir: string): string | boolean {
    if (!fs.existsSync(dir)) {
        return false;
    }
    const filePath = `${dir}/.env`;
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        return findEnvFile(path.resolve(dir, "../"));
    }
}

// Configuration define refer to https://github.com/kerimdzhanov/dotenv-flow-webpack
type DotEnvPluginOptionsType = {
    // Default: process.env.NODE_ENV
    node_env?: string;
    // Default: undefined
    default_node_env?: string | undefined;
    // Default: process.cwd() (current working directory)
    path?: string;
    // Default: false
    system_vars?: boolean;
};

type DotEnvPluginType = (options: DotEnvPluginOptionsType) => Plugin;

const dotEnvFlowPlugin: DotEnvPluginType = () => {
    return {
        name: "DotEnv",
        setup(build: PluginBuild) {
            build.onResolve({ filter: /^env$/ }, args => {
                // find a .env file in current directory or any parent:
                return {
                    path: findEnvFile(args.resolveDir) as string,
                    namespace: "env-ns",
                };
            });

            build.onLoad({ filter: /.*/, namespace: "env-ns" }, async args => {
                // read in .env file contents and combine with regular .env:
                const data = await fs.promises.readFile(args.path, "utf8");
                const buf = Buffer.from(data);
                const config = require("dotenv").parse(buf);

                return {
                    contents: JSON.stringify({ ...process.env, ...config }),
                    loader: "json",
                };
            });
        },
    };
};
export default dotEnvFlowPlugin;
