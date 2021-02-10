import type AgoraSdk from "agora-electron-sdk";
import { AGORA, NODE_ENV } from "../constants/Process";
import { globalStore } from "../stores/GlobalStore";
import { generateRTCToken } from "./flatServer/agora";

/** @see {@link https://docs.agora.io/cn/Video/API%20Reference/electron/index.html} */
const AgoraRtcEngine = window.AgoraRtcEngine;

export enum RtcChannelType {
    Communication = 0,
    Broadcast = 1,
    Gaming = 2,
}

export interface RtcConfig {
    channelType: RtcChannelType;
}

export class Rtc {
    rtcEngine: AgoraSdk;
    private appID: string = AGORA.APP_ID || "";
    // User can only join one RTC channel at a time.
    private roomUUID: string;
    private isCreator: boolean;

    constructor(config: { roomUUID: string; isCreator: boolean }) {
        this.roomUUID = config.roomUUID;
        this.isCreator = config.isCreator;

        if (!this.appID) {
            throw new Error("Agora App Id not set.");
        }

        this.rtcEngine = new AgoraRtcEngine();

        this.rtcEngine.on("tokenPrivilegeWillExpire", async () => {
            if (this.roomUUID) {
                const token = await generateRTCToken(this.roomUUID);
                this.rtcEngine.renewToken(token);
            }
        });

        if (NODE_ENV === "development") {
            const path = require("path");
            const logpath = path.join(__dirname, "..", "..", "agorasdk.log");
            // set where log file should be put for problem diagnostic
            this.rtcEngine.setLogFile(logpath);

            this.rtcEngine.on("joinedChannel", async (channel, uid) => {
                console.log(`[RTC] ${uid} join channel ${channel}`);
            });

            this.rtcEngine.on("userJoined", uid => {
                console.log("[RTC] userJoined", uid);
            });

            this.rtcEngine.on("leavechannel", () => {
                console.log(`[RTC] onleaveChannel`);
            });

            this.rtcEngine.on("error", (err, msg) => {
                console.error(`[RTC] onerror----`, err, msg);
            });
        }

        if (this.rtcEngine.initialize(this.appID) < 0) {
            throw new Error("[RTC] The app ID is invalid. Check if it is in the correct format.");
        }
    }

    async join(rtcUID: number, channelType = RtcChannelType.Communication): Promise<void> {
        const token = globalStore.rtcToken || (await generateRTCToken(this.roomUUID));

        this.rtcEngine.setChannelProfile(channelType);
        this.rtcEngine.videoSourceSetChannelProfile(channelType);
        this.rtcEngine.setVideoEncoderConfiguration({
            bitrate: 0,
            degradationPreference: 1,
            frameRate: 15,
            minBitrate: -1,
            minFrameRate: -1,
            mirrorMode: 0,
            orientationMode: 0,
            height: 216,
            width: 288,
        });

        if (channelType === RtcChannelType.Broadcast) {
            if (this.isCreator) {
                this.rtcEngine.setClientRole(1);
            } else {
                this.rtcEngine.setClientRole(2);
            }
        }

        this.rtcEngine.joinChannel(token, this.roomUUID, "", rtcUID);
    }

    leave(): void {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
    }

    destroy(): void {
        this.rtcEngine.removeAllListeners();
        this.rtcEngine.release();
    }
}
