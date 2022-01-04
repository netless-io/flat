import { builtinModules } from "module";
import { Plugin as VitePlugin } from "vite";
import { build } from "esbuild";

// based on https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/electron/src/index.ts

const entries = [
    {
        entryPoints: "electron/index.js",
        shouldBundle: false,
        code: `
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
        `,
    },
    {
        entryPoints: "events/events.js",
        shouldBundle: false,
        code: `
// The api doc is at: https://nodejs.org/api/events.html
// I'd just export EventEmitter.
const {
    EventEmitter,
} = require('events');
export {
    EventEmitter,
}
export default { EventEmitter };
 `,
    },
    {
        entryPoints: "fs-extra/lib/index.js",
        code: `
// We will use hack method to bundle file and export it with esm
const {
    copy,
    ensureDir,
    remove,
    pathExists ,
} = require('fs-extra');
export {
    copy,
    ensureDir,
    remove,
    pathExists,
}
 `,
        shouldBundle: true,
    },
    {
        entryPoints: "extract-zip/index.js",
        code: `
// We will use hack method to bundle file and export it with esm
const extract = require('fs-extra');
export default extract;
    `,
        shouldBundle: true,
    },
];

const cleanUrl = (url: string): string => url.replace(/\?.*$/s, "").replace(/#.*$/s, "");

const needParse = (
    id: string,
    entries: Array<{ entryPoints: string; code: string; shouldBundle: boolean }>,
): Promise<string | null> => {
    const cid = cleanUrl(id);
    let result: Promise<string | null> = Promise.resolve(null);
    for (const key of entries) {
        if (cid.endsWith(key.entryPoints)) {
            if (key.shouldBundle) {
                const path = id.replace(/(\?v=)(\w+)/g, "");
                result = build({
                    entryPoints: [path],
                    bundle: true,
                    outfile: "index.js",
                    platform: "node",
                    write: false,
                })
                    .then(result => {
                        return (
                            result?.outputFiles
                                ?.map(item => {
                                    return item.text;
                                })
                                .join("") ?? ""
                        );
                    })
                    .then(result => {
                        return result.concat(key?.code);
                    })
                    .catch(e => {
                        console.warn(e);
                        return null;
                    });
            } else {
                return Promise.resolve(key.code);
            }
        }
    }
    return result;
};
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
            return needParse(id, entries);
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
    return [builtinModulesResolve, nodeModelResolve];
}

electron.externals = externals;
export default electron;
