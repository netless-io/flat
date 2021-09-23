import type {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    ILocalAudioTrack,
    IMicrophoneAudioTrack,
    IRemoteAudioTrack,
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
    LowVolume = "low-volume",
}

/**
 * @example
 * const avatar = new RtcAvatar({ rtc, userUUID, avatarUser })
 * avatar.element = el
 * avatar.setCamera(true)
 */
export class RtcAvatar extends EventEmitter {
    public static readonly LowVolume = 0.00001;
    public static readonly LowVolumeMaxCount = 10;

    public readonly userUUID: string;
    public readonly avatarUser: User;
    public audioTrack?: ITrack;
    public videoTrack?: ITrack;

    private _element?: HTMLElement;
    private readonly rtc: RtcRoom;
    private readonly isLocal: boolean;
    private remoteUser?: IAgoraRTCRemoteUser;
    private mic = false;
    private camera = false;
    private observeVolumeId: number;
    private observeVolumeCounter = 0;

    public constructor({ rtc, userUUID, avatarUser }: RtcAvatarParams) {
        super();
        this.rtc = rtc;
        this.userUUID = userUUID;
        this.avatarUser = avatarUser;
        this.isLocal = userUUID === avatarUser.userUUID;
        this.rtc.addAvatar(this);
        this.observeVolumeId = window.setInterval(this.checkVolume, 500);
    }

    public destroy(): void {
        clearInterval(this.observeVolumeId);
        this.rtc.removeAvatar(this);
    }

    private get client(): IAgoraRTCClient {
        return this.rtc.client!;
    }

    public get element(): HTMLElement | undefined {
        return this._element;
    }

    public set element(el: HTMLElement | undefined) {
        this._element = el;
        !this.isLocal && this.refreshRemoteTracks();
    }

    public refreshRemoteTracks(): void {
        this.remoteUser = this.client.remoteUsers.find(user => user.uid === this.avatarUser.rtcUID);
        if (!this.remoteUser) {
            this.audioTrack = undefined;
            this.videoTrack = undefined;
            return;
        }
        this.audioTrack = this.remoteUser.audioTrack;
        this.videoTrack = this.remoteUser.videoTrack;
        if (this.audioTrack) {
            if (this.audioTrack.isPlaying !== this.mic) {
                console.log("[rtc] mic=%O, uid=%O", this.mic, this.avatarUser.rtcUID);
                this.mic ? this.audioTrack.play() : this.audioTrack.stop();
            }
        }
        if (this.videoTrack) {
            if (this.videoTrack.isPlaying !== this.camera) {
                console.log("[rtc] camera=%O, uid=%O", this.camera, this.avatarUser.rtcUID);
                this.camera
                    ? this.element && this.videoTrack.play(this.element)
                    : this.videoTrack.stop();
            }
        }
    }

    private isRefreshingLocalCamera = false;
    private async refreshLocalCamera(): Promise<void> {
        if (this.isRefreshingLocalCamera) {
            console.log("[rtc] refreshing local camera rejected because of pending");
            return;
        }
        this.isRefreshingLocalCamera = true;
        console.log("[rtc] start refreshing local camera");

        try {
            if (this.camera && !this.videoTrack) {
                console.log("[rtc] start getting local camera");
                this.videoTrack = await this.rtc.getLocalVideoTrack();
                console.log("[rtc] got local camera, start play");
                this.element && this.videoTrack?.play(this.element);
            } else if (this.videoTrack) {
                await (this.videoTrack as ICameraVideoTrack).setEnabled(this.camera);
            }
        } catch (error) {
            this.videoTrack = undefined;
            this.emit(RtcEvents.SetCameraError, error);
        }

        console.log("[rtc] refreshed local camera");
        this.isRefreshingLocalCamera = false;
    }

    private isRefreshingLocalMic = false;
    private async refreshLocalMic(): Promise<void> {
        if (this.isRefreshingLocalMic) {
            console.log("[rtc] refreshing local mic rejected because of pending");
            return;
        }
        this.isRefreshingLocalMic = true;
        console.log("[rtc] start refreshing local mic");

        try {
            if (this.mic && !this.audioTrack) {
                console.log("[rtc] start getting local mic");
                this.audioTrack = await this.rtc.getLocalAudioTrack();
                console.log("[rtc] got local mic, not play");
                // NOTE: play local audio will cause echo
                // this.audioTrack.play();
            } else if (this.audioTrack) {
                await (this.audioTrack as IMicrophoneAudioTrack).setEnabled(this.mic);
            }
        } catch (error) {
            this.audioTrack = undefined;
            this.emit(RtcEvents.SetMicError, error);
        }

        console.log("[rtc] refreshed local mic");
        this.isRefreshingLocalMic = false;
    }

    public async setCamera(enable: boolean): Promise<void> {
        console.log("[rtc] rtm: setCamera", enable);
        this.camera = enable;
        if (this.isLocal) {
            try {
                await this.refreshLocalCamera();
            } catch (error) {
                this.emit(RtcEvents.SetCameraError, error);
            }
        } else {
            this.refreshRemoteTracks();
        }
    }

    public async setMic(enable: boolean): Promise<void> {
        console.log("[rtc] rtm: setMic", enable);
        this.mic = enable;
        if (this.isLocal) {
            try {
                await this.refreshLocalMic();
            } catch (error) {
                this.emit(RtcEvents.SetMicError, error);
            }
        } else {
            this.refreshRemoteTracks();
        }
    }

    private checkVolume = (): void => {
        if (this.isLocal && this.mic && this.audioTrack) {
            const track = this.audioTrack as ILocalAudioTrack | IRemoteAudioTrack;
            const volume = track.getVolumeLevel();
            if (volume <= RtcAvatar.LowVolume) {
                this.observeVolumeCounter += 1;
                if (this.observeVolumeCounter === RtcAvatar.LowVolumeMaxCount) {
                    console.log("[rtc] volume low: %O", volume);
                    this.emit(RtcEvents.LowVolume);
                }
            }
        } else {
            this.observeVolumeCounter = 0;
        }
    };
}
