import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    ILocalTrack,
    IMicrophoneAudioTrack,
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

    constructor({ rtc, userUUID, avatarUser }: RtcAvatarParams) {
        this.rtc = rtc;
        this.userUUID = userUUID;
        this.avatarUser = avatarUser;
        this.isLocal = userUUID === avatarUser.userUUID;
        if (!this.isLocal) {
            this.setupExistingTracks();
            this.client.on("user-published", this.onUserPublished);
            this.client.on("user-unpublished", this.onUserUnpublished);
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
                audioTrack.play();
            }
            if (exist.hasVideo) {
                const videoTrack = await this.client.subscribe(exist, "video");
                this.element && videoTrack.play(this.element);
            }
        }
    }

    public async destroy(): Promise<void> {
        const { audioTrack, videoTrack } = this;
        const tracks: ITrack[] = [];
        if (audioTrack) {
            audioTrack.stop();
            this.audioTrack = undefined;
            tracks.push(audioTrack);
        }
        if (videoTrack) {
            videoTrack.stop();
            this.videoTrack = undefined;
            tracks.push(videoTrack);
        }
        if (this.isLocal) {
            if (tracks.length > 0) {
                try {
                    await this.client.unpublish(tracks as ILocalTrack[]);
                } catch (error) {
                    console.info("unpublish failed", error);
                }
            }
            for (const track of tracks) {
                (track as ILocalTrack).close();
            }
        } else {
            this.client.off("user-published", this.onUserPublished);
        }
    }

    private onUserPublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "video" | "audio",
    ): Promise<void> => {
        if (user.uid === this.avatarUser.rtcUID) {
            const track = await this.client.subscribe(user, mediaType);
            if (mediaType === "audio") {
                this.audioTrack = track;
                this.audioTrack.play();
            } else {
                this.videoTrack = track;
                this.element && this.videoTrack.play(this.element);
            }
        }
    };

    private onUserUnpublished = async (
        user: IAgoraRTCRemoteUser,
        mediaType: "video" | "audio",
    ): Promise<void> => {
        if (user.uid === this.avatarUser.rtcUID) {
            if (mediaType === "audio") {
                if (this.audioTrack) {
                    this.audioTrack.stop();
                    this.audioTrack = undefined;
                }
            } else {
                if (this.videoTrack) {
                    this.videoTrack.stop();
                    this.videoTrack = undefined;
                }
            }
            try {
                await this.client.unsubscribe(user, mediaType);
            } catch (error) {
                console.info("unsubscribe failed", error);
            }
        }
    };

    public async setCamera(enable: boolean): Promise<void> {
        try {
            if (this.isLocal) {
                const videoTrack = this.videoTrack as ICameraVideoTrack | undefined;
                if (videoTrack) {
                    await videoTrack.setEnabled(enable);
                } else if (enable) {
                    const videoTrack = await AgoraRTC.createCameraVideoTrack({
                        encoderConfig: { width: 288, height: 216 },
                    });
                    await this.client.publish(videoTrack);
                    this.element && videoTrack.play(this.element);
                    this.videoTrack = videoTrack;
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
                    await audioTrack.setEnabled(enable);
                } else if (enable) {
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    await this.client.publish(audioTrack);
                    // NOTE: playing local audio track causes echo
                    // audioTrack.play();
                    this.audioTrack = audioTrack;
                }
            }
        } catch (error) {
            console.info("setMic failed", error);
        }
    }
}
