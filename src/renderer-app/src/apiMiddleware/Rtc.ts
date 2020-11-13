// @ts-ignore
const AgoraRtcEngine = window.AgoraRtcEngine;

export class Rtc {
    rtcEngine: any;
    appId = process.env.AGORA_APP_ID;

    constructor() {
        this.rtcEngine = new AgoraRtcEngine();
        console.log(this.rtcEngine);
        this.initEvnet();
        this.rtcEngine.initialize(this.appId);
    }

    initEvnet() {
        this.rtcEngine.on("joinedChannel", async (channel: string, uid: number, _elapsed: any) => {
            console.log(`${uid} join channel ${channel}`);
        });

        this.rtcEngine.on("userJoined", (uid: string) => {
            console.log("userJoined", uid);
        });

        this.rtcEngine.on("leavechannel", (rtcStats: any) => {
            console.log(`onleaveChannel----`, rtcStats);
        });

        this.rtcEngine.on("error", (rtcStats: any) => {
            console.error(`onerror----`, rtcStats);
        });
    }

    join(channel: string, dom: HTMLDivElement | null) {
        this.rtcEngine.setupLocalVideo(dom);
        this.rtcEngine.setChannelProfile(1);
        this.rtcEngine.setClientRole(1);
        this.rtcEngine.enableVideo();
        // const logpath = path.join(os.homedir(), "agorasdk.log");
        // set where log file should be put for problem diagnostic
        // this.rtcEngine.setLogFile(logpath);
        this.rtcEngine.joinChannel(null, channel, null, Math.floor(new Date().getTime() / 1000));
    }

    leave() {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }
}
