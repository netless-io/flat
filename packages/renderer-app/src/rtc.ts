import path from "path";
import os from "os";
const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const AgoraRtcEngine = require("agora-electron-sdk").default;

export class Rtc {
    rtcEngine: any;

    constructor() {
        this.rtcEngine = new AgoraRtcEngine();
        console.log(this.rtcEngine);
        this.rtcEngine.initialize(APP_ID);
        this.initEvnet();
    }

    initEvnet() {
        this.rtcEngine.on("joinedChannel", (channel: string, uid: string, elapsed: any) => {
            console.log(`${uid} join channel ${channel}`);
        });
        this.rtcEngine.on("userJoined", (uid: string) => {
            console.log("userJoined", uid);
        });

        this.rtcEngine.on("leavechannel", (rtcStats: any) => {
            console.log(`onleaveChannel----`, rtcStats);
        });
    }

    join(channel: string, dom: HTMLDivElement | null) {
        this.rtcEngine.setupLocalVideo(dom);
        this.rtcEngine.setChannelProfile(1);
        this.rtcEngine.setClientRole(1);
        this.rtcEngine.enableVideo();
        const logpath = path.join(os.homedir(), "agorasdk.log");
        // set where log file should be put for problem diagnostic
        this.rtcEngine.setLogFile(logpath);
        this.rtcEngine.joinChannel(null, channel, null, Math.floor(new Date().getTime() / 1000));
    }

    leave() {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }
}
