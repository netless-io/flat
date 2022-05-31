import { Plugin, PluginBuild } from "esbuild";
import dotenvFlow, { DotenvConfigOptions } from "dotenv-flow";

function parseWithEnvObject(orgEnv: Record<string, string | undefined>): Record<string, string> {
    return Reflect.ownKeys(orgEnv)
        ?.map(item => {
            if (typeof item === "string") {
                const tmp: Record<string, any> = {};
                tmp[`process.env.${item}`] = `"${orgEnv?.[item]}"`;
                return tmp;
            }
            return {};
        })
        ?.reduce((prev, cur) => {
            return {
                ...prev,
                ...cur,
            };
        }, {});
}

// Configuration define refer to https://github.com/kerimdzhanov/dotenv-flow-webpack
type DotEnvPluginOptionsType = Omit<DotenvConfigOptions, "purge_dotenv" | "silent"> & {
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
                ...(esbuildOptions?.define || {}),
                ...sysEnvList,
                ...configEnvList,
            };

            console.log(build.initialOptions);
        },
    };
};

export default dotEnvFlowPlugin;
