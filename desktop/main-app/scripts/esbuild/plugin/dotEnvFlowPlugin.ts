import { Plugin, PluginBuild } from "esbuild";
import dotenvFlow, { DotenvConfigOptions } from "dotenv-flow";

function parseWithEnvObject(orgEnv: Record<string, string | undefined>): Record<string, string> {
    return Reflect.ownKeys(orgEnv)
        ?.map(item => {
            const result: Record<string, any> = {};
            if (
                typeof item === "string" &&
                orgEnv?.[item] &&
                !item.includes("(") &&
                !item.includes(" ")
            ) {
                result[`process.env.${item}`] = JSON.stringify(orgEnv?.[item]);
            }
            return result;
        })
        ?.reduce((prev, cur) => {
            return {
                ...prev,
                ...cur,
            };
        }, {});
}

// Configuration define refer to https://github.com/kerimdzhanov/dotenv-flow-webpack
type DotEnvPluginOptionsType = Omit<DotenvConfigOptions, "purge_dotenv"> & {
    system_vars?: boolean;
};

type DotEnvPluginType = (options: DotEnvPluginOptionsType) => Plugin;

const dotEnvFlowPlugin: DotEnvPluginType = options => {
    return {
        name: "DotEnvFlow",
        setup(build: PluginBuild) {
            let sysEnvList = {};

            const esbuildOptions = build.initialOptions;

            const result = dotenvFlow.config(options);

            if (result.error) {
                console.warn("esbuild dotenvFlow throw error:", result.error);
                return;
            }

            if (options?.system_vars) {
                sysEnvList = parseWithEnvObject(process.env);
            }

            const configEnvList = parseWithEnvObject(result?.parsed || {});

            esbuildOptions.define = {
                ...esbuildOptions?.define,
                ...sysEnvList,
                ...configEnvList,
            };
        },
    };
};

export default dotEnvFlowPlugin;
