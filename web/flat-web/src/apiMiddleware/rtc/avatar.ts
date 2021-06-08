import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteAudioTrack,
    IRemoteVideoTrack,
    ITrack,
} from "agora-rtc-sdk-ng";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { User } from "../../stores/UserStore";
import type { RtcRoom } from "./room";

export interface RtcAvatarParams {
    rtc: RtcRoom;
    userUUID: string;
    avatarUser: User;
}

/**
 * @example
 * const avatar = new RtcAvatar({ rtc, userUUID, avatarUser })
 * avatar.element = el
 * avatar.setCamera(true)
 */
export class RtcAvatar {
    private readonly rtc: RtcRoom;

    public readonly userUUID: string;
    public readonly avatarUser: User;
    public element?: HTMLElement;
    public audioTrack?: ITrack;
    public videoTrack?: ITrack;

    private readonly isLocal: boolean;
    private readonly remoteAudioTrack: Promise<IRemoteAudioTrack>;
    private readonly remoteVideoTrack: Promise<IRemoteVideoTrack>;

    private resolveRemoteAudioTrack?: (value: IRemoteAudioTrack) => void;
    private resolveRemoteVideoTrack?: (value: IRemoteVideoTrack) => void;

    constructor({ rtc, userUUID, avatarUser }: RtcAvatarParams) {
        this.rtc = rtc;
        this.userUUID = userUUID;
        this.avatarUser = avatarUser;
        this.isLocal = userUUID === avatarUser.userUUID;
        this.remoteAudioTrack = new Promise<IRemoteAudioTrack>(resolve => {
            this.resolveRemoteAudioTrack = resolve;
        });
        this.remoteVideoTrack = new Promise<IRemoteVideoTrack>(resolve => {
            this.resolveRemoteVideoTrack = resolve;
        });
        if (!this.isLocal) {
            this.setupExistingTracks();
            this.client.on("user-published", this.onUserPublished);
        }
    }

    private get client(): IAgoraRTCClient {
        return this.rtc.client!;
    }

    private async setupExistingTracks(): Promise<void> {
        const exist = this.client.remoteUsers.find(e => e.uid === this.avatarUser.rtcUID);
        if (exist) {
            if (exist.hasAudio) {
                const audioTrack = await this.client.subscribe(exist, "audio");
                this.resolveRemoteAudioTrack?.(audioTrack);
                this.resolveRemoteAudioTrack = undefined;
            }
            if (exist.hasVideo) {
                const videoTrack = await this.client.subscribe(exist, "video");
                this.resolveRemoteVideoTrack?.(videoTrack);
                this.resolveRemoteVideoTrack = undefined;
            }
        }
    }

    public destroy(): void {
        if (this.isLocal) {
            const { audioTrack, videoTrack } = this;
            if (audioTrack) {
                this.audioTrack = undefined;
                (audioTrack as IMicrophoneAudioTrack).close();
            }
            if (videoTrack) {
                this.videoTrack = undefined;
                (videoTrack as ICameraVideoTrack).close();
            }
        }
        if (!this.isLocal && this.client) {
            this.client.off("user-published", this.onUserPublished);
        }
        this.resolveRemoteAudioTrack = undefined;
        this.resolveRemoteVideoTrack = undefined;
    }

    private onUserPublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "video" | "audio",
    ): Promise<void> => {
        if (user.uid === this.avatarUser.rtcUID) {
            const track = await this.client.subscribe(user, mediaType);
            if (mediaType === "audio") {
                this.resolveRemoteAudioTrack?.(track as IRemoteAudioTrack);
                this.resolveRemoteAudioTrack = undefined;
            } else {
                this.resolveRemoteVideoTrack?.(track as IRemoteVideoTrack);
                this.resolveRemoteVideoTrack = undefined;
            }
        }
    };

    public async setCamera(enable: boolean): Promise<void> {
        try {
            if (this.isLocal) {
                const videoTrack = this.videoTrack as ICameraVideoTrack | undefined;
                if (videoTrack) {
                    videoTrack.setEnabled(enable);
                } else if (enable) {
                    const videoTrack = await AgoraRTC.createCameraVideoTrack({
                        encoderConfig: { width: 288, height: 216 },
                    });
                    this.videoTrack = videoTrack;
                    this.element && videoTrack.play(this.element);
                    await this.client.publish([videoTrack]);
                }
            } else {
                if (!this.videoTrack && enable) {
                    const videoTrack = await this.remoteVideoTrack;
                    this.videoTrack = videoTrack;
                    this.element && videoTrack.play(this.element);
                }
            }
        } catch (error) {
            console.info("setCamera failed", error);
        }
    }

    public async setMic(enable: boolean): Promise<void> {
        try {
            if (this.isLocal) {
                const audioTrack = this.audioTrack as IMicrophoneAudioTrack | undefined;
                if (audioTrack) {
                    audioTrack.setEnabled(enable);
                } else if (enable) {
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    this.audioTrack = audioTrack;
                    audioTrack.play();
                    await this.client.publish(audioTrack);
                }
            } else {
                if (!this.audioTrack && enable) {
                    const audioTrack = await this.remoteAudioTrack;
                    this.audioTrack = audioTrack;
                    audioTrack.play();
                }
            }
        } catch (error) {
            console.info("setMic failed", error);
        }
    }
}

(window as any).RtcAvatar = RtcAvatar;
