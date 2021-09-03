import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    ITrack,
} from "agora-rtc-sdk-ng";
import { EventEmitter } from "eventemitter3";
import type { User } from "../../stores/UserStore";
import type { RtcRoom } from "./room";

export interface RtcAvatarParams {
    rtc: RtcRoom;
    userUUID: string;
    avatarUser: User;
}

export enum RtcEvents {
    SetCameraError = "set-camera-error",
    SetMicError = "set-mic-error",
}

/**
 * @example
 * const avatar = new RtcAvatar({ rtc, userUUID, avatarUser })
 * avatar.element = el
 * avatar.setCamera(true)
 */
export class RtcAvatar extends EventEmitter {
    public readonly userUUID: string;
    public readonly avatarUser: User;
    public element?: HTMLElement;
    public audioTrack?: ITrack;
    public videoTrack?: ITrack;

    private readonly rtc: RtcRoom;
    private readonly isLocal: boolean;
    private remoteUser?: IAgoraRTCRemoteUser;
    private mic = false;
    private camera = false;

    public constructor({ rtc, userUUID, avatarUser }: RtcAvatarParams) {
        super();
        this.rtc = rtc;
        this.userUUID = userUUID;
        this.avatarUser = avatarUser;
        this.isLocal = userUUID === avatarUser.userUUID;
        this.rtc.addAvatar(this);
    }

    public destroy(): void {
        this.rtc.removeAvatar(this);
    }

    private get client(): IAgoraRTCClient {
        return this.rtc.client!;
    }

    public async refresh(): Promise<void> {
        if (this.isLocal) {
            await this.refreshLocalMic();
            await this.refreshLocalCamera();
        } else {
            this.remoteUser = this.client.remoteUsers.find(
                user => user.uid === this.avatarUser.rtcUID,
            );
            if (!this.remoteUser) {
                this.audioTrack = undefined;
                this.videoTrack = undefined;
                return;
            }
            this.audioTrack = this.remoteUser.audioTrack;
            this.videoTrack = this.remoteUser.videoTrack;
            this.refreshRemoteTracks();
        }
    }

    private refreshRemoteTracks(): void {
        if (this.audioTrack) {
            if (this.audioTrack.isPlaying !== this.mic) {
                this.mic ? this.audioTrack.play() : this.audioTrack.stop();
            }
        }
        if (this.videoTrack) {
            if (this.videoTrack.isPlaying !== this.camera) {
                this.camera
                    ? this.element && this.videoTrack.play(this.element)
                    : this.videoTrack.stop();
            }
        }
    }

    private async refreshLocalCamera(): Promise<void> {
        if (this.camera && !this.videoTrack) {
            this.videoTrack = await this.rtc.getLocalVideoTrack();
            this.element && this.videoTrack.play(this.element);
        } else if (this.videoTrack && this.videoTrack.isPlaying !== this.camera) {
            await (this.videoTrack as ICameraVideoTrack).setEnabled(this.camera);
        }
    }

    private async refreshLocalMic(): Promise<void> {
        if (this.mic && !this.audioTrack) {
            this.audioTrack = await this.rtc.getLocalAudioTrack();
            // NOTE: play local audio will cause echo
            // this.audioTrack.play();
        } else if (this.audioTrack && this.audioTrack.isPlaying !== this.mic) {
            await (this.audioTrack as IMicrophoneAudioTrack).setEnabled(this.mic);
        }
    }

    public async setCamera(enable: boolean): Promise<void> {
        this.camera = enable;
        await this.refresh().catch(error => this.emit(RtcEvents.SetMicError, error));
    }

    public async setMic(enable: boolean): Promise<void> {
        this.mic = enable;
        await this.refresh().catch(error => this.emit(RtcEvents.SetCameraError, error));
    }
}
