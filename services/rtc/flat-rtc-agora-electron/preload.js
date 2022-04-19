const { Val } = require("value-enhancer");

const agoraRtcSDK$ = new Val(null);
window.agoraRtcSDK$ = agoraRtcSDK$;

/**
 * @param {string} [AGORA_APP_ID]
 */
module.exports.flatRTCAgoraElectronPreload = AGORA_APP_ID => {
    if (!AGORA_APP_ID) {
        throw new Error("Agora App Id not set.");
    }

    const AgoraRtcSDK = require("agora-electron-sdk").default;

    const rtcEngine = new AgoraRtcSDK();

    if (rtcEngine.initialize(process.env.AGORA_APP_ID) < 0) {
        throw new Error("[RTC] The app ID is invalid. Check if it is in the correct format.");
    }

    agoraRtcSDK$.setValue(rtcEngine);
};
