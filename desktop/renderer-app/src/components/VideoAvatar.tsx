import React, { useEffect, useRef } from "react";
import type AgoraSDK from "agora-electron-sdk";
import { observer } from "mobx-react-lite";
import { useUpdateEffect } from "react-use";
import { User } from "../stores/ClassRoomStore";

import cameraIconSVG from "../assets/image/camera.svg";
import cameraDisabledSVG from "../assets/image/camera-disabled.svg";
import microphoneSVG from "../assets/image/microphone.svg";
import microphoneDisabledSVG from "../assets/image/microphone-disabled.svg";
import "./VideoAvatar.less";
import { RoomStatus } from "../apiMiddleware/flatServer/constants";

export interface VideoAvatarProps {
    isCreator: boolean;
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser: User;
    roomStatus: RoomStatus;
    rtcEngine: AgoraSDK;
    updateDeviceState: (id: string, camera: boolean, mic: boolean) => void;
    children: (canvas: React.ReactNode, ctrlBtns: React.ReactNode) => JSX.Element | null;
}

export const VideoAvatar = observer<VideoAvatarProps>(function VideoAvatar({
    isCreator,
    userUUID,
    avatarUser,
    roomStatus,
    rtcEngine,
    updateDeviceState,
    children,
}) {
    /** avatar element */
    const elRef = useRef<HTMLDivElement | null>(null);

    // when classroom is paused, turn off the creator's camera and mic
    // but leave joiners' unchanged
    const isCameraOn = (!isCreator || roomStatus === RoomStatus.Started) && avatarUser.camera
    const isMicOn = (!isCreator || roomStatus === RoomStatus.Started) && avatarUser.mic;

    useUpdateEffect(() => {
        if (userUUID === avatarUser.userUUID) {
            rtcEngine.enableLocalVideo(isCameraOn);
        } else {
            rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !isCameraOn);
        }
    }, [isCameraOn]);

    useUpdateEffect(() => {
        if (userUUID === avatarUser.userUUID) {
            rtcEngine.enableLocalAudio(isMicOn);
        } else {
            rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !isMicOn);
        }
    }, [isMicOn]);

    useEffect(
        () => () => {
            if (userUUID === avatarUser.userUUID) {
                rtcEngine.enableLocalVideo(false);
                rtcEngine.enableLocalAudio(false);
            } else {
                rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, true);
                rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, true);
            }
        },
        [rtcEngine, userUUID, avatarUser.userUUID, avatarUser.rtcUID],
    );

    const isCameraCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !isCameraOn);

    const isMicCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !isMicOn);

    const canvas = (
        <div
            className="video-avatar-canvas"
            ref={el => {
                if (!el || elRef.current === el) {
                    return;
                }

                elRef.current = el;

                if (el) {
                    if (userUUID === avatarUser.userUUID) {
                        rtcEngine.setupLocalVideo(el);
                        rtcEngine.enableLocalVideo(isCameraOn);
                        rtcEngine.enableLocalAudio(isMicOn);
                    } else {
                        rtcEngine.setupRemoteVideo(avatarUser.rtcUID, el);
                        rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !isCameraOn);
                        rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !isMicOn);
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
                        updateDeviceState(avatarUser.userUUID, !isCameraOn, isMicOn);
                    }
                }}
                disabled={isCameraCtrlDisable}
            >
                <img src={isCameraOn ? cameraIconSVG : cameraDisabledSVG} alt="camera" />
            </button>
            <button
                onClick={() => {
                    if (isCreator || userUUID === avatarUser.userUUID) {
                        updateDeviceState(avatarUser.userUUID, isCameraOn, !isMicOn);
                    }
                }}
                disabled={isMicCtrlDisable}
            >
                <img
                    src={isMicOn ? microphoneSVG : microphoneDisabledSVG}
                    alt="microphone"
                />
            </button>
        </div>
    );

    return children(canvas, ctrlBtns);
});

export default VideoAvatar;
