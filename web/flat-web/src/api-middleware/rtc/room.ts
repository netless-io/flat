import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    ILocalAudioTrack,
    ILocalVideoTrack,
    IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import type { RtcAvatar } from "./avatar";
import type { Disposer } from "./hot-plug";

import AgoraRTC from "agora-rtc-sdk-ng";
import { AGORA } from "../../constants/process";
import { globalStore } from "../../stores/GlobalStore";
import { generateRTCToken } from "../flatServer/agora";
import { setCameraTrack, setMicrophoneTrack, hotPlug } from "./hot-plug";
import { configStore } from "../../stores/config-store";

AgoraRTC.enableLogUpload();

if (process.env.PROD) {
    AgoraRTC.setLogLevel(/* WARNING */ 2);
}

if (process.env.DEV) {
    (window as any).AgoraRTC = AgoraRTC;
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

    private resolveJoined!: () => void;
    private joined = new Promise<void>(resolve => {
        this.resolveJoined = resolve;
    });
    private roomUUID?: string;
    private hotPlugDisposer?: Disposer;

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
            return this.client;
        }

        const mode = channelType === RtcChannelType.Communication ? "rtc" : "live";
        this.client = AgoraRTC.createClient({ mode, codec: "vp8" });
        (window as any).rtc_client = this.client;

        this.client.on("token-privilege-will-expire", this.renewToken);
        this.client.on("exception", console.warn.bind(console, ">>>> exception >>>>"));

        if (mode !== "rtc") {
            await this.client.setClientRole(
                channelType === RtcChannelType.Broadcast && !isCreator ? "audience" : "host",
            );
        }
        const token = globalStore.rtcToken || (await generateRTCToken(roomUUID));

        this.client.on("user-published", this.onUserPublished);
        this.client.on("user-unpublished", this.onUserUnpublished);
        await this.client.join(AGORA.APP_ID, roomUUID, token, rtcUID);
        this.resolveJoined();

        this.roomUUID = roomUUID;
        this.hotPlugDisposer = hotPlug();

        return this.client;
    }

    public getLatency(): number {
        return this.client?.getRTCStats().RTT ?? NaN;
    }

    public async destroy(): Promise<void> {
        if (this.hotPlugDisposer) {
            this.hotPlugDisposer();
            this.hotPlugDisposer = undefined;
        }
        if (this.client) {
            await this.joined;
            setMicrophoneTrack();
            setCameraTrack();
            if (this.client.localTracks.length > 0) {
                for (const track of this.client.localTracks) {
                    track.stop();
                    track.close();
                }
                console.log("[rtc] unpublish local tracks");
                await this.client.unpublish(this.client.localTracks);
            }
            this.client.off("user-published", this.onUserPublished);
            this.client.off("user-unpublished", this.onUserUnpublished);
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
            await this.joined;
            this._localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                microphoneId: configStore.microphoneId,
            });
            setMicrophoneTrack(this._localAudioTrack as IMicrophoneAudioTrack);
            this._localAudioTrack.once("track-ended", () => {
                console.log("[rtc] track-ended local audio");
            });
            console.log("[rtc] publish audio track");
            await this.client?.publish(this._localAudioTrack);
        }
        return this._localAudioTrack;
    }

    public async getLocalVideoTrack(): Promise<ILocalVideoTrack> {
        if (!this._localVideoTrack) {
            await this.joined;
            this._localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: { width: 288, height: 216 },
                cameraId: configStore.cameraId,
            });
            setCameraTrack(this._localVideoTrack as ICameraVideoTrack);
            this._localVideoTrack.once("track-ended", () => {
                console.log("[rtc] track-ended local video");
            });
            console.log("[rtc] publish video track");
            await this.client?.publish(this._localVideoTrack);
        }
        return this._localVideoTrack;
    }

    private onUserPublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "audio" | "video",
    ): Promise<void> => {
        if (user.uid === globalStore?.rtcShareScreen?.uid) {
            console.log("[rtc] subscribe (skip share screen) uid=%O", user.uid);
            return;
        }
        console.log("[rtc] subscribe uid=%O, media=%O", user.uid, mediaType);
        await this.client?.subscribe(user, mediaType);
        this.avatars.forEach(avatar => avatar.refreshRemoteTracks());
    };

    private onUserUnpublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "audio" | "video",
    ): Promise<void> => {
        if (user.uid === globalStore?.rtcShareScreen?.uid) {
            console.log("[rtc] unsubscribe (skip share screen) uid=%O", user.uid);
            return;
        }
        console.log("[rtc] unsubscribe uid=%O, media=%O", user.uid, mediaType);
        await this.client?.unsubscribe(user, mediaType);
        this.avatars.forEach(avatar => avatar.refreshRemoteTracks());
    };

    private renewToken = async (): Promise<void> => {
        if (this.client && this.roomUUID) {
            const token = await generateRTCToken(this.roomUUID);
            await this.client.renewToken(token);
        }
    };
}
