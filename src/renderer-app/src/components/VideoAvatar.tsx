import React from "react";
import type AgoraSDK from "agora-electron-sdk";

export enum VideoType {
    remote,
    local,
}

export interface VideoAvatarProps {
    type: VideoType;
    uid: string;
    rtcEngine: AgoraSDK;
}

export interface VideoAvatarState {
    isVideoOn: boolean;
    isAudioOn: boolean;
}

/** Video Calling Avatar */
export class VideoAvatar<
    P extends VideoAvatarProps,
    S extends VideoAvatarState
> extends React.PureComponent<P, S> {
    private el: HTMLDivElement | null = null;

    setupVideo = (el: HTMLDivElement | null): void => {
        this.el = el;
        if (this.el) {
            const { type, uid, rtcEngine } = this.props;
            const { isVideoOn, isAudioOn } = this.state;

            const numUid = Number(uid);
            if (Number.isNaN(numUid)) {
                throw new Error("RTC uid has to be number");
            }

            switch (type) {
                case VideoType.local: {
                    rtcEngine.setupLocalVideo(this.el);
                    rtcEngine.enableLocalVideo(isVideoOn);
                    rtcEngine.enableLocalAudio(isAudioOn);
                    break;
                }
                default: {
                    rtcEngine.setupRemoteVideo(numUid, this.el);
                    rtcEngine.muteAllRemoteVideoStreams(!isVideoOn);
                    rtcEngine.muteAllRemoteAudioStreams(!isAudioOn);
                    break;
                }
            }
        }
    };

    toggleVideo = () => {
        this.setState(
            state => ({ isVideoOn: !state.isVideoOn }),
            () => {
                const { type, rtcEngine } = this.props;
                const { isVideoOn } = this.state;
                if (this.el) {
                    switch (type) {
                        case VideoType.local: {
                            rtcEngine.enableLocalVideo(isVideoOn);
                            rtcEngine.muteLocalVideoStream(!isVideoOn);
                            break;
                        }
                        default: {
                            rtcEngine.muteAllRemoteVideoStreams(!isVideoOn);
                            break;
                        }
                    }
                }
            },
        );
    };

    toggleAudio = () => {
        this.setState(
            state => ({ isAudioOn: !state.isAudioOn }),
            () => {
                const { type, rtcEngine } = this.props;
                const { isAudioOn } = this.state;
                if (this.el) {
                    switch (type) {
                        case VideoType.local: {
                            rtcEngine.enableLocalAudio(isAudioOn);
                            rtcEngine.muteLocalAudioStream(!isAudioOn);
                            break;
                        }
                        default: {
                            rtcEngine.muteAllRemoteAudioStreams(!isAudioOn);
                            break;
                        }
                    }
                }
            },
        );
    };
}

export default VideoAvatar;
