const { ipcRenderer } = require("electron");

/**
 * cannot be used here DOMContentLoaded or DOMNodeInserted
 * because in some uncertain situations (may be related to computer configuration), these two methods will not be triggered
 */

/**
 * this method will only be triggered on the main page
 * see: WindowManager.ts
 */
ipcRenderer.once("inject-agora-electron-sdk-addon", () => {
    window.AgoraRtcEngine = require("agora-electron-sdk").default;

    window.rtcEngine = new window.AgoraRtcEngine();
    window.rtcEngine.initialize(process.env.AGORA_APP_ID);
});

// delay sending event. prevent the main process from being too late listen for this event
setTimeout(() => {
    ipcRenderer.send("preload-load");
}, 0);

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
