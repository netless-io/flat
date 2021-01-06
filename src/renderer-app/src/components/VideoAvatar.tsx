import React from "react";
import type AgoraSDK from "agora-electron-sdk";
import { Identity } from "../utils/localStorage/room";
// @TODO wait for server implementing user info
import { RTMUser } from "../components/ChatPanel/ChatUser";

import cameraIcon from "../assets/image/camera.svg";
import cameraDisabled from "../assets/image/camera-disabled.svg";
import microphone from "../assets/image/microphone.svg";
import microphoneDisabled from "../assets/image/microphone-disabled.svg";

export interface VideoAvatarProps {
    identity: Identity;
    /** id of current login user */
    userId: string;
    /** the user of this avatar */
    user: RTMUser;
    rtcEngine: AgoraSDK;
    updateDeviceState: (id: string, camera: boolean, mic: boolean) => void;
    children: (canvas: React.ReactNode, ctrlBtns: React.ReactNode) => React.ReactNode;
}

export class VideoAvatar extends React.PureComponent<VideoAvatarProps> {
    private el: HTMLDivElement | null = null;

    componentDidUpdate(prevProps: VideoAvatarProps) {
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
        const { user, userId, identity, children } = this.props;
        // creator can turn off joiners camera or mic but cannot turn on.
        const isCameraCtrlDisable =
            user.id !== userId && (identity !== Identity.creator || !user.camera);
        const isMicCtrlDisable = user.id !== userId && (identity !== Identity.creator || !user.mic);

        const canvas = <div className="video-avatar-canvas" ref={this.setupVideo}></div>;

        const ctrlBtns = (
            <div className="video-avatar-ctrl-btns">
                <button onClick={this.onCameraClick} disabled={isCameraCtrlDisable}>
                    <img src={user.camera ? cameraIcon : cameraDisabled} alt="camera" />
                </button>
                <button onClick={this.onMicClick} disabled={isMicCtrlDisable}>
                    <img src={user.mic ? microphone : microphoneDisabled} alt="microphone" />
                </button>
            </div>
        );

        return children(canvas, ctrlBtns);
    }

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
                rtcEngine.setupRemoteVideo(numUid, this.el);
                rtcEngine.muteRemoteVideoStream(numUid, !user.camera);
                rtcEngine.muteRemoteAudioStream(numUid, !user.mic);
            }
        }
    };

    private onCameraClick = (): void => {
        const { identity, userId, user } = this.props;

        if (identity === Identity.creator || userId === user.id) {
            this.props.updateDeviceState(user.id, !user.camera, user.mic);
        }
    };

    private onMicClick = (): void => {
        const { identity, userId, user } = this.props;

        if (identity === Identity.creator || userId === user.id) {
            this.props.updateDeviceState(user.id, user.camera, !user.mic);
        }
    };
}

export default VideoAvatar;
