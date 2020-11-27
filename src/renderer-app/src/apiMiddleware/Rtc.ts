import type AgoraSdk from "agora-electron-sdk";

const AgoraRtcEngine = window.AgoraRtcEngine;

export class Rtc {
    rtcEngine: AgoraSdk;
    appId: string = process.env.AGORA_APP_ID || "";
    uid: number | null = null;

    constructor(appId?: string) {
        if (appId !== void 0) {
            this.appId = appId;
        }

        if (!this.appId) {
            throw new Error("Agora App Id not set.");
        }

        this.rtcEngine = new AgoraRtcEngine();

        if (process.env.NODE_ENV === "development") {
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
        this.rtcEngine.setChannelProfile(1);
        this.rtcEngine.setClientRole(1);
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
