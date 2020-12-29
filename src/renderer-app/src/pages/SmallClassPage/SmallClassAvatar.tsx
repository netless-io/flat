import React from "react";
import classNames from "classnames";
import type AgoraSDK from "agora-electron-sdk";
import { Identity } from "../../utils/localStorage/room";
// @TODO wait for server implementing user info
import { RTMUser } from "../../components/ChatPanel/ChatUser";

import noCameraSmall from "../../assets/image/no-camera-small.svg";
import cameraIcon from "../../assets/image/camera.svg";
import cameraDisabled from "../../assets/image/camera-disabled.svg";
import microphone from "../../assets/image/microphone.svg";
import microphoneDisabled from "../../assets/image/microphone-disabled.svg";

import "./SmallClassAvatar.less";

export interface SmallClassAvatarProps {
    identity: Identity;
    /** id of current login user */
    userId: string;
    /** the user of this avatar */
    user: RTMUser;
    rtcEngine: AgoraSDK;
    onCameraClick: (user: RTMUser) => void;
    onMicClick: (user: RTMUser) => void;
}

export class SmallClassAvatar extends React.PureComponent<SmallClassAvatarProps> {
    private el: HTMLDivElement | null = null;

    componentDidUpdate(prevProps: SmallClassAvatarProps) {
        if (!this.el) {
            return;
        }

        const { userId, user, rtcEngine } = this.props;

        const numUid = Number(user.id);
        if (Number.isNaN(numUid)) {
            throw new Error("RTC uid has to be number");
        }

        if (prevProps.user.mic !== user.mic) {
            if (userId === user.id) {
                rtcEngine.enableLocalAudio(user.mic);
            } else {
                rtcEngine.setupRemoteVideo(numUid, this.el);
                rtcEngine.muteRemoteAudioStream(numUid, !user.mic);
            }
        }

        if (prevProps.user.camera !== user.camera) {
            if (userId === user.id) {
                rtcEngine.enableLocalVideo(user.camera);
            } else {
                rtcEngine.setupRemoteVideo(numUid, this.el);
                rtcEngine.muteRemoteVideoStream(numUid, !user.camera);
            }
        }
    }

    render(): React.ReactNode {
        const { user, userId, identity } = this.props;
        // creator can turn off joiners camera or mic but cannot turn on.
        const isCameraCtrlDisable =
            user.id !== userId && (identity !== Identity.creator || !user.camera);
        const isMicCtrlDisable = user.id !== userId && (identity !== Identity.creator || !user.mic);

        return (
            <section
                className={classNames("small-class-avatar-wrap", { "with-video": user.camera })}
            >
                <div className="small-class-avatar" ref={this.setupVideo}></div>
                <div className="small-class-avatar-ctrl-layer">
                    <img
                        className="small-class-avatar-no-camera"
                        src={noCameraSmall}
                        alt="no camera"
                    />
                    <h1 className="small-class-avatar-title">{user.name || user.id}</h1>
                    <div className="small-class-avatar-btns">
                        <button onClick={this.onCameraClick} disabled={isCameraCtrlDisable}>
                            <img src={user.camera ? cameraIcon : cameraDisabled} alt="camera" />
                        </button>
                        <button onClick={this.onMicClick} disabled={isMicCtrlDisable}>
                            <img
                                src={user.mic ? microphone : microphoneDisabled}
                                alt="microphone"
                            />
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    private onCameraClick = (): void => {
        const { identity, userId, user } = this.props;

        if (identity === Identity.creator || userId === user.id) {
            this.props.onCameraClick(this.props.user);
        }
    };

    private onMicClick = (): void => {
        const { identity, userId, user } = this.props;

        if (identity === Identity.creator || userId === user.id) {
            this.props.onMicClick(this.props.user);
        }
    };

    private setupVideo = (el: HTMLDivElement | null): void => {
        this.el = el;
        if (this.el) {
            const { userId, user, rtcEngine } = this.props;

            const numUid = Number(user.id);
            if (Number.isNaN(numUid)) {
                throw new Error("RTC uid has to be number");
            }

            if (userId === user.id) {
                rtcEngine.setupLocalVideo(this.el);
                rtcEngine.enableLocalVideo(user.camera);
                rtcEngine.enableLocalAudio(user.mic);
            } else {
                if (user.camera || user.mic) {
                    rtcEngine.setupRemoteVideo(numUid, this.el);
                    rtcEngine.muteRemoteVideoStream(numUid, !user.camera);
                    rtcEngine.muteRemoteAudioStream(numUid, !user.mic);
                }
            }
        }
    };
}

export default SmallClassAvatar;
