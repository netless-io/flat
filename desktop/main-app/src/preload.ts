import os from "os";
import path from "path";

const { ipcRenderer, shell } = require("electron");

const {
    agoraRTCElectronPreload,
} = require("@netless/flat-service-provider-agora-rtc-electron/preload");

/**
 * cannot be used here DOMContentLoaded or DOMNodeInserted
 * because in some uncertain situations (may be related to computer configuration), these two methods will not be triggered
 */

/**
 * this method will only be triggered on the main page
 * see: window-manager.ts
 */
ipcRenderer.once("preload-dom-ready", (_event, args: { AGORA_APP_ID: string }) => {
    agoraRTCElectronPreload(args.AGORA_APP_ID);
});

// because DOMContentLoaded and DOMNodeInserted cannot be used, a new method is adopted to solve the problem of jQuery import failure
Object.defineProperties(window, {
    $: {
        get() {
            return require("jquery");
        },
    },
    jQuery: {
        get() {
            return require("jquery");
        },
    },
});

ipcRenderer.send("preload-loaded");

// TODO: upgrade new version of the Electron after that replace contextBridge.exposeInMainWorld with window
(window as any).electron = {
    ipcRenderer: {
        on: (
            channel: string,
            listeners: (event: Electron.IpcRendererEvent, ...args: any[]) => void,
        ): Electron.IpcRenderer => ipcRenderer.on(channel, listeners),
        send: (channel: string, ...args: any[]): void => ipcRenderer.send(channel, ...args),
        invoke: (channel: string, ...args: any[]): Promise<any> =>
            ipcRenderer.invoke(channel, ...args),
        removeAllListeners: (channel: string): Electron.IpcRenderer =>
            ipcRenderer.removeAllListeners(channel),
    },
    shell: {
        openExternal: (
            url: string,
            options?: Electron.OpenExternalOptions | undefined,
        ): Promise<void> => shell.openExternal(url, options),
    },
};

(window as any).node = {
    os: {
        cpus: (): os.CpuInfo[] => os.cpus(),
        freemem: (): number => os.freemem(),
        platform: (): NodeJS.Platform => os.platform(),
    },
    path: {
        join: (...paths: string[]): string => path.join(...paths),
        dirname: (p: string): string => path.dirname(p),
        basename: (p: string, ext?: string | undefined): string => path.basename(p, ext),
    },
};

// code in renderer can use `if (window.isElectron)` with different logic
(window as any).isElectron = true;
