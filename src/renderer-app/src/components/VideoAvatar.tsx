import React from "react";
import type AgoraSDK from "agora-electron-sdk";
import classNames from "classnames";
import noCamera from "../assets/image/no-camera.svg";
import camera from "../assets/image/camera.svg";
import cameraDisabled from "../assets/image/camera-disabled.svg";
import microphone from "../assets/image/microphone.svg";
import microphoneDisabled from "../assets/image/microphone-disabled.svg";
import videoExpand from "../assets/image/video-expand.svg";
import "./VideoAvatar.less";

export enum VideoType {
    remote,
    local,
}

export interface VideoAvatarProps {
    type: VideoType;
    uid: string;
    rtcEngine: AgoraSDK;
    small?: boolean;
    onExpand?: () => void;
}

export interface VideoAvatarState {
    isVideoOn: boolean;
    isAudioOn: boolean;
}

/** Video Calling Avatar */
export class VideoAvatar extends React.PureComponent<VideoAvatarProps, VideoAvatarState> {
    private el: HTMLDivElement | null = null;

    constructor(props: VideoAvatarProps) {
        super(props);

        this.state = {
            isVideoOn: this.props.type === VideoType.remote,
            isAudioOn: true,
        };
    }

    render() {
        const { uid, small, onExpand, type } = this.props;
        const { isVideoOn, isAudioOn } = this.state;
        return (
            <section className={classNames("video-avatar-wrap", { "is-small": small })}>
                <div className="video-avatar" ref={this.setupVideo}></div>
                {(uid === null || !isVideoOn) && (
                    <div className="video-avatar-background">
                        <img src={noCamera} alt="no camera" />
                    </div>
                )}
                <div
                    className={classNames("video-avatar-ctrl-layer", {
                        "with-video": isVideoOn,
                    })}
                >
                    {small ? (
                        <button className="video-avatar-expand" onClick={onExpand}>
                            <img src={videoExpand} alt="expand" />
                        </button>
                    ) : (
                        <>
                            <h1 className="video-avatar-title">{uid}</h1>
                            {type === VideoType.local && (
                                <div className="video-avatar-btns">
                                    <button onClick={this.toggleVideo}>
                                        <img
                                            src={isVideoOn ? camera : cameraDisabled}
                                            alt="camera"
                                        />
                                    </button>
                                    <button onClick={this.toggleAudio}>
                                        <img
                                            src={isAudioOn ? microphone : microphoneDisabled}
                                            alt="microphone"
                                        />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        );
    }

    private setupVideo = (el: HTMLDivElement | null): void => {
        this.el = el;
        if (this.el) {
            const { type, uid, rtcEngine } = this.props;
            const { isVideoOn, isAudioOn } = this.state;

            const numUid = Number(uid);
            if (isNaN(numUid)) {
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
