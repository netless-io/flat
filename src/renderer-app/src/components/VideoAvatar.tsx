import React from "react";
import type AgoraSDK from "agora-electron-sdk";
import noCamera from "../assets/image/no-camera.svg";
import camera from "../assets/image/camera.svg";
import cameraDisabled from "../assets/image/camera-disabled.svg";
import microphone from "../assets/image/microphone.svg";
import microphoneDisabled from "../assets/image/microphone-disabled.svg";
import "./VideoAvatar.less";

export enum VideoType {
    remote,
    local,
}

export interface VideoAvatarProps {
    type: VideoType;
    uid: number;
    rtcEngine: AgoraSDK;
}

export interface VideoAvatarState {
    isVideoOn: boolean;
    isAudioOn: boolean;
}

/** Video Calling Avatar */
export class VideoAvatar extends React.PureComponent<VideoAvatarProps, VideoAvatarState> {
    private el: HTMLDivElement | null = null;

    state: VideoAvatarState = {
        isVideoOn: false,
        isAudioOn: true,
    };

    render() {
        const { uid } = this.props;
        const { isVideoOn, isAudioOn } = this.state;
        return (
            <section className="video-avatar-wrap">
                <div className="video-avatar" ref={this.setupVideo}></div>
                {(uid === null || !isVideoOn) && (
                    <div className="video-avatar-background">
                        <img src={noCamera} alt="no camera" />
                    </div>
                )}
                <h1 className="video-avatar-title">{uid}</h1>
                <div className="video-avatar-btns">
                    <button onClick={this.toggleVideo}>
                        <img src={isVideoOn ? camera : cameraDisabled} alt="camera" />
                    </button>
                    <button onClick={this.toggleAudio}>
                        <img src={isAudioOn ? microphone : microphoneDisabled} alt="microphone" />
                    </button>
                </div>
            </section>
        );
    }

    private setupVideo = (el: HTMLDivElement | null): void => {
        this.el = el;
        if (this.el) {
            const { type, uid, rtcEngine } = this.props;
            const { isVideoOn, isAudioOn } = this.state;
            switch (type) {
                case VideoType.local: {
                    rtcEngine.setupLocalVideo(this.el);
                    rtcEngine.enableLocalVideo(isVideoOn);
                    rtcEngine.enableLocalAudio(isAudioOn);
                    break;
                }
                default: {
                    rtcEngine.setupRemoteVideo(uid, this.el);
                    rtcEngine.muteAllRemoteVideoStreams(!isVideoOn);
                    rtcEngine.muteAllRemoteAudioStreams(!isAudioOn);
                    break;
                }
            }
        }
    };

    private toggleVideo = () => {
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

    private toggleAudio = () => {
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
