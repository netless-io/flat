import type { Plugin } from "vite";
import { configRegion } from "../../../scripts/utils/auto-choose-config";
import dotenvReal from "dotenv";
import { expand } from "dotenv-expand";
import fs from "fs";
import path from "path";

// 使用 require 导入 CommonJS 模块
const { configPath } = require("../../../scripts/constants");

/**
 * 替换 HTML 中的 process.env.XXX 为实际值
 * 因为 Vite 的 define 只替换模块代码，不替换 HTML 中的内联脚本
 */
export function injectHtmlEnv(): Plugin {
    return {
        name: "flat:html-env",
        enforce: "pre",
        transformIndexHtml: {
            enforce: "pre",
            transform(originalHTML) {
                const envVars = getEnvVars();
                let html = originalHTML;

                // 替换所有 process.env.XXX 为实际值
                for (const [key, value] of Object.entries(envVars)) {
                    const regex = new RegExp(`process\\.env\\.${key}`, "g");
                    html = html.replace(regex, JSON.stringify(value));
                }

                return {
                    html,
                    tags: [],
                };
            },
        },
    };
}

function getEnvVars(): Record<string, string> {
    const envVars: Record<string, string> = {};
    const mode = process.env.NODE_ENV === "production" ? "production" : "development";
    const envDir = path.join(configPath, configRegion());
    const envConfigContent = getEnvConfigContent(envDir, mode);

    // 设置 FLAT_REGION
    envVars.FLAT_REGION = configRegion();

    if (envConfigContent) {
        const parsed = dotenvReal.parse(envConfigContent);
        expand({ parsed });
        const env = { ...parsed };

        // 从环境变量文件中读取的值
        for (const [key, value] of Object.entries(env)) {
            envVars[key] = value;
        }
    }

    // 如果环境变量文件中有 FLAT_WEB_ALIYUN_PREFIX，使用它；否则使用默认值
    if (!envVars.FLAT_WEB_ALIYUN_PREFIX) {
        envVars.FLAT_WEB_ALIYUN_PREFIX = "195gxh";
    }

    return envVars;
}

function getEnvConfigContent(envDir: string, mode: string): string | null {
    const configFileList = [
        path.join(envDir, `.env.${mode}.local`),
        path.join(envDir, `.env.${mode}`),
    ];

    for (const filepath of configFileList) {
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
            return fs.readFileSync(filepath, "utf-8");
        }
    }

    return null;
}
