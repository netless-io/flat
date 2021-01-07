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
    avatarUser: RTMUser;
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

        const { userId, avatarUser, rtcEngine } = this.props;

        if (prevProps.avatarUser.mic !== avatarUser.mic) {
            if (userId === avatarUser.uuid) {
                rtcEngine.enableLocalAudio(avatarUser.mic);
            } else {
                rtcEngine.setupRemoteVideo(avatarUser.rtcUID, this.el);
                rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !avatarUser.mic);
            }
        }

        if (prevProps.avatarUser.camera !== avatarUser.camera) {
            if (userId === avatarUser.uuid) {
                rtcEngine.enableLocalVideo(avatarUser.camera);
            } else {
                rtcEngine.setupRemoteVideo(avatarUser.rtcUID, this.el);
                rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !avatarUser.camera);
            }
        }
    }

    render(): React.ReactNode {
        const { avatarUser, userId, identity, children } = this.props;
        // creator can turn off joiners camera or mic but cannot turn on.
        const isCameraCtrlDisable =
            avatarUser.uuid !== userId && (identity !== Identity.creator || !avatarUser.camera);
        const isMicCtrlDisable =
            avatarUser.uuid !== userId && (identity !== Identity.creator || !avatarUser.mic);

        const canvas = <div className="video-avatar-canvas" ref={this.setupVideo}></div>;

        const ctrlBtns = (
            <div className="video-avatar-ctrl-btns">
                <button onClick={this.onCameraClick} disabled={isCameraCtrlDisable}>
                    <img src={avatarUser.camera ? cameraIcon : cameraDisabled} alt="camera" />
                </button>
                <button onClick={this.onMicClick} disabled={isMicCtrlDisable}>
                    <img src={avatarUser.mic ? microphone : microphoneDisabled} alt="microphone" />
                </button>
            </div>
        );

        return children(canvas, ctrlBtns);
    }

    private setupVideo = (el: HTMLDivElement | null): void => {
        this.el = el;
        if (this.el) {
            const { userId, avatarUser, rtcEngine } = this.props;

            if (userId === avatarUser.uuid) {
                rtcEngine.setupLocalVideo(this.el);
                rtcEngine.enableLocalVideo(avatarUser.camera);
                rtcEngine.enableLocalAudio(avatarUser.mic);
            } else {
                rtcEngine.setupRemoteVideo(avatarUser.rtcUID, this.el);
                rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !avatarUser.camera);
                rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !avatarUser.mic);
            }
        }
    };

    private onCameraClick = (): void => {
        const { identity, userId, avatarUser } = this.props;

        if (identity === Identity.creator || userId === avatarUser.uuid) {
            this.props.updateDeviceState(avatarUser.uuid, !avatarUser.camera, avatarUser.mic);
        }
    };

    private onMicClick = (): void => {
        const { identity, userId, avatarUser } = this.props;

        if (identity === Identity.creator || userId === avatarUser.uuid) {
            this.props.updateDeviceState(avatarUser.uuid, avatarUser.camera, !avatarUser.mic);
        }
    };
}

export default VideoAvatar;
