import type AgoraRtcEngine from "agora-electron-sdk";
const { ipcRenderer } = require("electron");

/**
 * cannot be used here DOMContentLoaded or DOMNodeInserted
 * because in some uncertain situations (may be related to computer configuration), these two methods will not be triggered
 */

/**
 * this method will only be triggered on the main page
 * see: window-manager.ts
 */
ipcRenderer.once("inject-agora-electron-sdk-addon", () => {
    if (!process.env.AGORA_APP_ID) {
        throw new Error("Agora App Id not set.");
    }

    const AgoraRtcSDK = require("agora-electron-sdk").default;

    const rtcEngine: AgoraRtcEngine = new AgoraRtcSDK();
    window.rtcEngine = rtcEngine;

    if (rtcEngine.initialize(process.env.AGORA_APP_ID) < 0) {
        throw new Error("[RTC] The app ID is invalid. Check if it is in the correct format.");
    }

    if (process.env.NODE_ENV === "development") {
        rtcEngine.on("joinedChannel", (channel, uid) => {
            console.log(`[RTC] ${uid} join channel ${channel}`);
        });

        rtcEngine.on("userJoined", uid => {
            console.log("[RTC] userJoined", uid);
        });

        rtcEngine.on("leavechannel", () => {
            console.log("[RTC] onleaveChannel");
        });

        rtcEngine.on("error", (err, msg) => {
            console.error("[RTC] onerror----", err, msg);
        });
    }
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
