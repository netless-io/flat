import type AgoraSdk from "agora-electron-sdk";
import { AGORA, NODE_ENV } from "../constants/Process";
import { globals } from "../utils/globals";
import { Identity } from "../utils/localStorage/room";
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
    appId: string = AGORA.APP_ID || "";
    // User can only join one RTC channel at a time.
    roomUUID: string | null = null;

    constructor() {
        if (!this.appId) {
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

    async join(
        roomUUID: string,
        identity: Identity,
        rtcUID: number,
        channelType = RtcChannelType.Communication,
    ): Promise<void> {
        if (this.roomUUID) {
            if (this.roomUUID === roomUUID) {
                return;
            } else {
                throw new Error("User can only join one RTC channel at a time.");
            }
        }

        this.roomUUID = roomUUID;
        const token = globals.rtc.token || (await generateRTCToken(roomUUID));

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
            if (identity === Identity.creator) {
                this.rtcEngine.setClientRole(1);
            } else {
                this.rtcEngine.setClientRole(2);
            }
        }

        this.rtcEngine.enableLocalVideo(false);

        this.rtcEngine.joinChannel(token, roomUUID, "", rtcUID);
    }

    leave(): void {
        this.rtcEngine.leaveChannel();
        this.rtcEngine.videoSourceLeave();
        this.roomUUID = null;
    }

    destroy(): void {
        this.rtcEngine.removeAllListeners();
        this.rtcEngine.release();
        this.roomUUID = null;
    }
}
