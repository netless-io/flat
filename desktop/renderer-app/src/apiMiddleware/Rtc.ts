import type AgoraSdk from "agora-electron-sdk";
import { AGORA } from "../constants/Process";
import { globalStore } from "../stores/GlobalStore";
import { generateRTCToken } from "./flatServer/agora";

/** @see {@link https://docs.agora.io/cn/Video/API%20Reference/electron/index.html} */

export enum RtcChannelType {
    Communication = 0,
    Broadcast = 1,
    Gaming = 2,
}

export interface RtcConfig {
    channelType: RtcChannelType;
}

export class Rtc {
    public rtcEngine: AgoraSdk;
    private appID: string = AGORA.APP_ID || "";
    // User can only join one RTC channel at a time.
    private roomUUID: string | null = null;

    public constructor() {
        if (!this.appID) {
            throw new Error("Agora App Id not set.");
        }

        this.rtcEngine = window.rtcEngine;

        this.rtcEngine.on("tokenPrivilegeWillExpire", this.renewToken);
    }

    public async join({
        roomUUID,
        isCreator,
        rtcUID,
        channelType = RtcChannelType.Communication,
    }: {
        roomUUID: string;
        isCreator: boolean;
        rtcUID: number;
        channelType: RtcChannelType;
    }): Promise<void> {
        if (this.roomUUID !== null) {
            this.leave();
        }

        const token = globalStore.rtcToken || (await generateRTCToken(roomUUID));

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
        this.rtcEngine.enableVideo();

        if (channelType === RtcChannelType.Broadcast) {
            if (isCreator) {
                this.rtcEngine.setClientRole(1);
            } else {
                this.rtcEngine.setClientRole(2);
            }
        }

        if (this.rtcEngine.joinChannel(token, roomUUID, "", rtcUID) < 0) {
            throw new Error("[RTC]: join channel failed");
        }

        this.roomUUID = roomUUID;
    }

    public leave(): void {
        if (this.roomUUID !== null) {
            this.rtcEngine.leaveChannel();
            this.rtcEngine.videoSourceLeave();
            this.roomUUID = null;
        }
    }

    public destroy(): void {
        this.leave();
        this.rtcEngine.removeAllListeners("tokenPrivilegeWillExpire");
        this.rtcEngine.enableVideo();
    }

    private renewToken = async (): Promise<void> => {
        if (this.roomUUID) {
            const token = await generateRTCToken(this.roomUUID);
            this.rtcEngine.renewToken(token);
        }
    };
}
