import type AgoraSdk from "agora-electron-sdk";
import { AGORA } from "../constants/process";
import { globalStore } from "../stores/global-store";
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
    private rtcUID?: number;

    private volumeLevels = new Map<number, number>();

    public constructor() {
        if (!this.appID) {
            throw new Error("Agora App Id not set.");
        }

        this.rtcEngine = window.rtcEngine;

        this.rtcEngine.on("tokenPrivilegeWillExpire", this.renewToken);
        this.rtcEngine.on("groupAudioVolumeIndication", this.updateVolumeLevel);
        this.rtcEngine.on("userOffline", this.deleteVolumeLevel);
        this.rtcEngine.on("userMuteAudio", this.deleteVolumeLevel);
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

        if (channelType === RtcChannelType.Broadcast) {
            if (isCreator) {
                this.rtcEngine.setClientRole(1);
            } else {
                this.rtcEngine.setClientRole(2);
            }
        }

        this.rtcEngine.enableVideo();
        // prevent camera being turned on temporarily right after joining room
        this.rtcEngine.enableLocalVideo(false);

        if (this.rtcEngine.joinChannel(token, roomUUID, "", rtcUID) < 0) {
            throw new Error("[RTC]: join channel failed");
        }

        this.rtcEngine.enableAudioVolumeIndication(500, 3);

        this.roomUUID = roomUUID;
        this.rtcUID = rtcUID;
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
        this.rtcEngine.off("tokenPrivilegeWillExpire", this.renewToken);
        this.rtcEngine.off("groupAudioVolumeIndication", this.updateVolumeLevel);
        this.rtcEngine.off("userOffline", this.deleteVolumeLevel);
        this.rtcEngine.off("userMuteAudio", this.deleteVolumeLevel);
        this.rtcEngine.enableVideo();
    }

    public getVolumeLevel(uid: number): number {
        return this.volumeLevels.get(uid) || 0;
    }

    private renewToken = async (): Promise<void> => {
        if (this.roomUUID) {
            const token = await generateRTCToken(this.roomUUID);
            this.rtcEngine.renewToken(token);
        }
    };

    private updateVolumeLevel = (speakers: Array<{ uid: number; volume: number }>): void => {
        speakers.forEach(({ uid, volume }) => {
            if (uid === 0 && this.rtcUID) {
                this.volumeLevels.set(this.rtcUID, volume / 255);
            } else {
                this.volumeLevels.set(uid, volume / 255);
            }
        });
    };

    private deleteVolumeLevel = (uid: number): void => {
        this.volumeLevels.delete(uid);
    };
}
