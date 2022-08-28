const { Val } = require("value-enhancer");

const agoraRtcSDK$ = new Val(null);
window.agoraRtcSDK$ = agoraRtcSDK$;

/**
 * @param {string} [AGORA_APP_ID]
 */
module.exports.agoraRTCElectronPreload = AGORA_APP_ID => {
    if (agoraRtcSDK$.value) {
        return;
    }

    if (!AGORA_APP_ID) {
        throw new Error("Agora App Id not set.");
    }

    const AgoraRtcSDK = require("agora-electron-sdk").default;

    const rtcEngine = new AgoraRtcSDK();

    if (rtcEngine.initialize(AGORA_APP_ID) < 0) {
        throw new Error("[RTC] The app ID is invalid. Check if it is in the correct format.");
    }

    agoraRtcSDK$.setValue(rtcEngine);
};
