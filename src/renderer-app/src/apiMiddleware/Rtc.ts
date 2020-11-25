import AgoraSdk from "agora-electron-sdk";

const AgoraRtcEngine = window.AgoraRtcEngine;

export class Rtc {
    rtcEngine: AgoraSdk;
    appId: string = process.env.AGORA_APP_ID || "";
    uid: number | null = null;

    constructor() {
        if (!this.appId) {
            throw new Error("Agora App Id not set.");
        }
        this.rtcEngine = new AgoraRtcEngine();
        this.initEvnet();
        this.rtcEngine.initialize(this.appId);
    }

    initEvnet() {
        this.rtcEngine.on("joinedChannel", async (channel, uid) => {
            if (process.env.NODE_ENV === "development") {
                console.log(`${uid} join channel ${channel}`);
            }

            this.uid = uid;
        });

        this.rtcEngine.on("userJoined", uid => {
            if (process.env.NODE_ENV === "development") {
                console.log("userJoined", uid);
            }
        });

        this.rtcEngine.on("leavechannel", () => {
            if (process.env.NODE_ENV === "development") {
                console.log(`onleaveChannel`);
            }
        });

        this.rtcEngine.on("error", (err, msg) => {
            if (process.env.NODE_ENV === "development") {
                console.error(`onerror----`, err, msg);
            }
        });
    }

    join(channel: string, dom: HTMLDivElement) {
        this.rtcEngine.setupLocalVideo(dom);
        this.rtcEngine.setChannelProfile(1);
        this.rtcEngine.setClientRole(1);
        this.rtcEngine.enableVideo();

        if (process.env.NODE_ENV === "development") {
            const path = require("path");
            const logpath = path.join(__dirname, "..", "..", "agorasdk.log");
            // set where log file should be put for problem diagnostic
            this.rtcEngine.setLogFile(logpath);
        }

        // @ts-ignore @TODO 鉴权机制待实现
        this.rtcEngine.joinChannel(null, channel, null, Math.floor(new Date().getTime() / 1000));
    }

    leave() {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }
}
