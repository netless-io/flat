import type AgoraSdk from "agora-electron-sdk";
import { AGORA, NODE_ENV } from "../constants/Process";
import { Identity } from "../utils/localStorage/room";

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

    join(channel: string, identity: Identity, uid: string) {
        const numUid = Number(uid);
        if (isNaN(numUid)) {
            throw new Error("RTC uid has to be number");
        }

        this.rtcEngine.setChannelProfile(1);
        this.rtcEngine.videoSourceSetChannelProfile(1);
        this.rtcEngine.setVideoEncoderConfiguration({
            bitrate: 0,
            degradationPreference: 1,
            frameRate: 15,
            height: 216,
            minBitrate: -1,
            minFrameRate: -1,
            mirrorMode: 0,
            orientationMode: 0,
            width: 288,
        });

        if (identity === Identity.creator) {
            this.rtcEngine.setClientRole(1);
        } else {
            this.rtcEngine.setClientRole(2);
        }

        // @ts-ignore @TODO 鉴权机制待实现
        this.rtcEngine.joinChannel(null, channel, null, numUid);
    }

    leave() {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }

    destroy() {
        this.rtcEngine.removeAllListeners();
        this.rtcEngine.release();
    }
}
