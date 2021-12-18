import { builtinModules } from "module";
import { Plugin as VitePlugin } from "vite";
// based on https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/electron/src/index.ts

/**
 * The externals will be work on 'viteConfig.build.rollupOptions.external', 'viteConfig.optimizeDeps.exclude' option.
 * and we should external ['electron', ...require('module').builtinModules]
 */
const externals = ["electron", ...builtinModules];
export function electron(): VitePlugin[] {
    const cleanUrl = (url: string): string => url.replace(/\?.*$/s, "").replace(/#.*$/s, "");
    const isLoadElectron = (id: string): boolean => {
        const cid = cleanUrl(id);
        // pre-build: 'node_modules/.vite/electron.js'
        // yarn     : 'node_modules/electron/index.js'
        // npm      : 'node_modules/electron/index.js'
        return cid.endsWith("electron/index.js") || cid.endsWith(".vite/electron.js");
    };

    const electronResolve: VitePlugin = {
        name: "vite-plugin-electron:electron-resolve",
        apply: "serve",
        transform(_code, id) {
            if (isLoadElectron(id)) {
                const electronModule = `
/**
 * All exports module see https://www.electronjs.org -> API -> Renderer Process Modules
 */
const {
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
} = require('electron');
export {
  clipboard,
  nativeImage,
  shell,
  contextBridge,
  crashReporter,
  ipcRenderer,
  webFrame,
  desktopCapturer,
}
export default { clipboard, nativeImage, shell, contextBridge, crashReporter, ipcRenderer, webFrame, desktopCapturer };
`;

                return {
                    code: electronModule,
                    map: null,
                };
            }

            return null;
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

                    const nodeModuleCode = `
${requireTpl}
${declaresTpl}
${exportTpl}
${exportDefault}
`;
                    return {
                        code: nodeModuleCode,
                        map: null,
                    };
                }
            }

            return null;
        },
    };

    return [electronResolve, builtinModulesResolve];
}

electron.externals = externals;
export default electron;
