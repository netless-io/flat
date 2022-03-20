import { builtinModules } from "module";
import { Plugin as VitePlugin } from "vite";
import { cjs2esm } from "./utils";
import { options } from "./template/options";

// based on https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/electron/src/index.ts

/**
 * The externals will be work on 'viteConfig.build.rollupOptions.external', 'viteConfig.optimizeDeps.exclude' option.
 * and we should external ['electron', ...require('module').builtinModules]
 */
const externals = ["electron", ...builtinModules];

export function electron(): VitePlugin[] {
    const nodeModelResolve: VitePlugin = {
        name: "vite-plugin-electron:node-model-resolve",
        apply: "serve",
        transform(_code, id) {
            return cjs2esm(id, options);
        },
    };

    const builtinModulesResolve: VitePlugin = {
        apply: "serve",
        name: "vite-plugin-electron:builtinModules-resolve",
        transform(_code, id) {
            /**
             * vite not support node build in model so will throw Error to tell `node api is not support in browser`
             * We need transform and overwrite error.
             * e.g:
             *      `import path from 'path'`
             * vite will analyze this import statement and replace to
             * `throw new Error('path is not support in browser!')`
             */
            if (!id.startsWith("__vite-browser-external:")) {
                return null;
            }

            const moduleName = id.split(":")[1];

            if (!builtinModules.includes(moduleName)) {
                return null;
            }

            // require all project import `nodeModule`
            const nodeModule = require(moduleName);
            const exportKeys = Object.keys(nodeModule as {});
            const requireTpl = `const __nodeModule = require("${moduleName}");`;
            const declaresTpl = exportKeys
                .map(key => `const ${key} = __nodeModule.${key};`)
                .join("\n");

            // transform all `nodeModule` to ESM grammar
            const exportTpl = `export { ${exportKeys.join(", ")} };`;
            const exportDefault = `export default { ${exportKeys.join(", ")} };`;

            const nodeModuleCode = ["", requireTpl, declaresTpl, exportTpl, exportDefault, ""].join(
                "\n",
            );

            return {
                code: nodeModuleCode,
                map: null,
            };
        },
    };

    return [builtinModulesResolve, nodeModelResolve];
}

electron.externals = externals;
export default electron;
