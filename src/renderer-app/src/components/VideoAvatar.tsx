import React, { useRef } from "react";
import type AgoraSDK from "agora-electron-sdk";
import { observer } from "mobx-react-lite";
import { User } from "../stores/ClassRoomStore";
import { useReaction } from "../utils/mobx";

import cameraIcon from "../assets/image/camera.svg";
import cameraDisabled from "../assets/image/camera-disabled.svg";
import microphone from "../assets/image/microphone.svg";
import microphoneDisabled from "../assets/image/microphone-disabled.svg";

export interface VideoAvatarProps {
    isCreator: boolean;
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser: User;
    rtcEngine: AgoraSDK;
    updateDeviceState: (id: string, camera: boolean, mic: boolean) => void;
    children: (canvas: React.ReactNode, ctrlBtns: React.ReactNode) => JSX.Element | null;
}

export const VideoAvatar = observer<VideoAvatarProps>(function VideoAvatar({
    isCreator,
    userUUID,
    avatarUser,
    rtcEngine,
    updateDeviceState,
    children,
}) {
    /** avatar element */
    const elRef = useRef<HTMLDivElement | null>(null);

    useReaction(
        () => avatarUser.camera,
        (camera, prevCamera) => {
            if (!elRef.current) {
                return;
            }

            if (camera !== prevCamera) {
                if (userUUID === avatarUser.userUUID) {
                    rtcEngine.enableLocalVideo(camera);
                } else {
                    rtcEngine.setupRemoteVideo(avatarUser.rtcUID, elRef.current);
                    rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !camera);
                }
            }
        },
    );

    useReaction(
        () => avatarUser.mic,
        (mic, prevMic) => {
            if (!elRef.current) {
                return;
            }

            if (mic !== prevMic) {
                if (userUUID === avatarUser.userUUID) {
                    rtcEngine.enableLocalAudio(mic);
                } else {
                    rtcEngine.setupRemoteVideo(avatarUser.rtcUID, elRef.current);
                    rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !mic);
                }
            }
        },
    );

    const isCameraCtrlDisable =
        avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.camera);

    const isMicCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.mic);

    const canvas = (
        <div
            className="video-avatar-canvas"
            ref={el => {
                elRef.current = el;

                if (el) {
                    if (userUUID === avatarUser.userUUID) {
                        rtcEngine.setupLocalVideo(el);
                        rtcEngine.enableLocalVideo(avatarUser.camera);
                        rtcEngine.enableLocalAudio(avatarUser.mic);
                    } else {
                        rtcEngine.setupRemoteVideo(avatarUser.rtcUID, el);
                        rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !avatarUser.camera);
                        rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !avatarUser.mic);
                    }
                }
            }}
        />
    );

    const ctrlBtns = (
        <div className="video-avatar-ctrl-btns">
            <button
                onClick={() => {
                    if (isCreator || userUUID === avatarUser.userUUID) {
                        updateDeviceState(avatarUser.userUUID, !avatarUser.camera, avatarUser.mic);
                    }
                }}
                disabled={isCameraCtrlDisable}
            >
                <img src={avatarUser.camera ? cameraIcon : cameraDisabled} alt="camera" />
            </button>
            <button
                onClick={() => {
                    if (isCreator || userUUID === avatarUser.userUUID) {
                        updateDeviceState(avatarUser.userUUID, avatarUser.camera, !avatarUser.mic);
                    }
                }}
                disabled={isMicCtrlDisable}
            >
                <img src={avatarUser.mic ? microphone : microphoneDisabled} alt="microphone" />
            </button>
        </div>
    );

    return children(canvas, ctrlBtns);
});

export default VideoAvatar;
