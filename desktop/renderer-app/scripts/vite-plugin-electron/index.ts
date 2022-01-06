import { builtinModules } from "module";
import { Plugin as VitePlugin } from "vite";
import { needParse } from "./utils";
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
            return needParse(id, options);
        },
    };

    const builtinModulesResolve: VitePlugin = {
        apply: "serve",
        name: "vite-plugin-electron:builtinModules-resolve",
        transform(_code, id) {
            if (id.includes("__vite-browser-external")) {
                const moduleId = id.split(":")[1];
                if (builtinModules.includes(moduleId)) {
                    const nodeModule = require(moduleId);
                    const attrs = Object.keys(nodeModule);
                    const requireTpl = `const __nodeModule = require('${moduleId}');`;
                    const declaresTpl =
                        attrs.map(attr => `const ${attr} = __nodeModule.${attr}`).join(";\n") + ";";
                    const exportTpl = `export {\n  ${attrs.join(",\n  ")},\n}`;
                    const exportDefault = `export default { ${attrs.join(", ")} };`;
                    const nodeModuleCode = [
                        "",
                        requireTpl,
                        declaresTpl,
                        exportTpl,
                        exportDefault,
                        "",
                    ].join("\n");
                    return {
                        code: nodeModuleCode,
                        map: null,
                    };
                }
            }

            return null;
        },
    };
    return [builtinModulesResolve, nodeModelResolve];
}

electron.externals = externals;
export default electron;
