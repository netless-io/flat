export {};

const { ipcRenderer } = require("electron");
const { flatRTCAgoraElectronPreload } = require("@netless/flat-rtc-agora-electron/preload");

/**
 * cannot be used here DOMContentLoaded or DOMNodeInserted
 * because in some uncertain situations (may be related to computer configuration), these two methods will not be triggered
 */

/**
 * this method will only be triggered on the main page
 * see: window-manager.ts
 */
ipcRenderer.once("preload-dom-ready", () => {
    flatRTCAgoraElectronPreload(process.env.AGORA_APP_ID);
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
