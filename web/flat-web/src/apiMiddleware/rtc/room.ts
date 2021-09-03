import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ILocalAudioTrack,
    ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { RtcAvatar } from "./avatar";
import { AGORA } from "../../constants/Process";
import { globalStore } from "../../stores/GlobalStore";
import { generateRTCToken } from "../flatServer/agora";

AgoraRTC.enableLogUpload();

if (process.env.PROD) {
    AgoraRTC.setLogLevel(/* WARNING */ 2);
}

export enum RtcChannelType {
    Communication = 0,
    Broadcast = 1,
}

/**
 * Flow:
 * ```
 * join() -> now it has `client`
 *   getLatency() -> number
 * destroy()
 * ```
 */
export class RtcRoom {
    public client?: IAgoraRTCClient;

    private roomUUID?: string;

    public async join({
        roomUUID,
        isCreator,
        rtcUID,
        channelType,
    }: {
        roomUUID: string;
        isCreator: boolean;
        rtcUID: number;
        channelType: RtcChannelType;
    }): Promise<IAgoraRTCClient> {
        if (this.client) {
            await this.destroy();
        }

        const mode = channelType === RtcChannelType.Communication ? "rtc" : "live";
        this.client = AgoraRTC.createClient({ mode, codec: "vp8" });

        this.client.on("token-privilege-will-expire", this.renewToken);

        if (mode !== "rtc") {
            await this.client.setClientRole(
                channelType === RtcChannelType.Broadcast && !isCreator ? "audience" : "host",
            );
        }
        const token = globalStore.rtcToken || (await generateRTCToken(roomUUID));
        await this.client.join(AGORA.APP_ID, roomUUID, token, rtcUID);

        this.roomUUID = roomUUID;

        this.client.on("user-published", this.onUserPublished);
        this.client.on("user-unpublished", this.onUserUnpublished);

        return this.client;
    }

    public getLatency(): number {
        return this.client?.getRTCStats().RTT ?? NaN;
    }

    public async destroy(): Promise<void> {
        if (this.client) {
            if (this.client.localTracks.length > 0) {
                this.client.localTracks.forEach(track => track.stop());
                await this.client.unpublish(this.client.localTracks);
            }
            this.client.off("token-privilege-will-expire", this.renewToken);
            await this.client.leave();
            this.client = undefined;
        }
    }

    private _localAudioTrack?: ILocalAudioTrack;
    private _localVideoTrack?: ILocalVideoTrack;
    private avatars: Set<RtcAvatar> = new Set();

    public addAvatar(avatar: RtcAvatar): void {
        this.avatars.add(avatar);
    }

    public removeAvatar(avatar: RtcAvatar): void {
        this.avatars.delete(avatar);
    }

    public async getLocalAudioTrack(): Promise<ILocalAudioTrack> {
        if (!this._localAudioTrack) {
            this._localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            await this.client?.publish(this._localAudioTrack);
        }
        return this._localAudioTrack;
    }

    public async getLocalVideoTrack(): Promise<ILocalVideoTrack> {
        if (!this._localVideoTrack) {
            this._localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: { width: 288, height: 216 },
            });
            await this.client?.publish(this._localVideoTrack);
        }
        return this._localVideoTrack;
    }

    private onUserPublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "audio" | "video",
    ): Promise<void> => {
        await this.client?.subscribe(user, mediaType);
        this.avatars.forEach(avatar => avatar.refresh());
    };

    private onUserUnpublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "audio" | "video",
    ): Promise<void> => {
        await this.client?.unsubscribe(user, mediaType);
        this.avatars.forEach(avatar => avatar.refresh());
    };

    private renewToken = async (): Promise<void> => {
        if (this.client && this.roomUUID) {
            const token = await generateRTCToken(this.roomUUID);
            await this.client.renewToken(token);
        }
    };
}
