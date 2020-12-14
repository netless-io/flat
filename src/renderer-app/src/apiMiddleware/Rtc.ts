import type AgoraSdk from "agora-electron-sdk";
import { AGORA, NODE_ENV } from "../constants/Process";

/** @see {@link https://docs.agora.io/cn/Video/API%20Reference/electron/index.html} */
const AgoraRtcEngine = window.AgoraRtcEngine;

export class Rtc {
    rtcEngine: AgoraSdk;
    appId: string = AGORA.APP_ID || "";
    uid: number | null = null;

    constructor(appId?: string) {
        if (appId !== void 0) {
            this.appId = appId;
        }

        if (!this.appId) {
            throw new Error("Agora App Id not set.");
        }

        this.rtcEngine = new AgoraRtcEngine();

        if (NODE_ENV === "development") {
            const path = require("path");
            const logpath = path.join(__dirname, "..", "..", "agorasdk.log");
            // set where log file should be put for problem diagnostic
            this.rtcEngine.setLogFile(logpath);

            this.rtcEngine.on("joinedChannel", async (channel, uid) => {
                console.log(`${uid} join channel ${channel}`);
            });

            this.rtcEngine.on("userJoined", uid => {
                console.log("userJoined", uid);
            });

            this.rtcEngine.on("leavechannel", () => {
                console.log(`onleaveChannel`);
            });

            this.rtcEngine.on("error", (err, msg) => {
                console.error(`onerror----`, err, msg);
            });
        }

        if (this.rtcEngine.initialize(this.appId) < 0) {
            throw new Error("The app ID is invalid. Check if it is in the correct format.");
        }
    }

    join(channel: string) {
        this.rtcEngine.videoSourceSetChannelProfile(0);
        this.rtcEngine.setVideoEncoderConfiguration({
            bitrate: 0,
            degradationPreference: 1,
            frameRate: 15,
            height: 280,
            minBitrate: -1,
            minFrameRate: -1,
            mirrorMode: 0,
            orientationMode: 0,
            width: 280,
        });
        this.rtcEngine.enableVideo();

        // @ts-ignore @TODO 鉴权机制待实现
        this.rtcEngine.joinChannel(null, channel, null, Math.floor(new Date().getTime() / 1000));
    }

    leave() {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }

    destroy() {
        this.rtcEngine.removeAllListeners();
    }
}
