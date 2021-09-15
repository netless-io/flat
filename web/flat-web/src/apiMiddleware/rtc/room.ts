import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    ILocalAudioTrack,
    ILocalVideoTrack,
    IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { RtcAvatar } from "./avatar";
import { AGORA } from "../../constants/Process";
import { globalStore } from "../../stores/GlobalStore";
import { generateRTCToken } from "../flatServer/agora";
import { setCameraTrack, setMicrophoneTrack } from "./hot-plug";

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

        this.client.on("user-published", this.onUserPublished);
        this.client.on("user-unpublished", this.onUserUnpublished);
        await this.client.join(AGORA.APP_ID, roomUUID, token, rtcUID);

        this.roomUUID = roomUUID;

        return this.client;
    }

    public getLatency(): number {
        return this.client?.getRTCStats().RTT ?? NaN;
    }

    public async destroy(): Promise<void> {
        if (this.client) {
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
            this._localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
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
            this._localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: { width: 288, height: 216 },
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
        this.avatars.forEach(avatar => {
            if (mediaType === "video") {
                if (!avatar.pendingSetCamera) {
                    avatar.pendingSetCamera = { promise: Promise.resolve() };
                } else {
                    avatar.pendingSetCamera.resolve?.();
                }
            }
            if (mediaType === "audio") {
                if (!avatar.pendingSetMic) {
                    avatar.pendingSetMic = { promise: Promise.resolve() };
                } else {
                    avatar.pendingSetMic.resolve?.();
                }
            }
        });
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
