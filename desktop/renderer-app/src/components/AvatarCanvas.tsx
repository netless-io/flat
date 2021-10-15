import "./AvatarCanvas.less";

import React, { useEffect, useRef } from "react";
import type AgoraSDK from "agora-electron-sdk";
import { observer } from "mobx-react-lite";
import { useUpdateEffect } from "react-use";
import { User } from "../stores/class-room-store";

export interface AvatarCanvasProps {
    isCreator: boolean;
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser: User;
    rtcEngine: AgoraSDK;
    updateDeviceState: (id: string, camera: boolean, mic: boolean) => void;
}

export const AvatarCanvas = observer<AvatarCanvasProps>(function AvatarCanvas({
    userUUID,
    avatarUser,
    rtcEngine,
}) {
    /** avatar element */
    const elRef = useRef<HTMLDivElement | null>(null);

    useUpdateEffect(() => {
        if (userUUID === avatarUser.userUUID) {
            rtcEngine.enableLocalVideo(avatarUser.camera);
        } else {
            rtcEngine.muteRemoteVideoStream(avatarUser.rtcUID, !avatarUser.camera);
        }
    }, [avatarUser.camera]);

    useUpdateEffect(() => {
        if (userUUID === avatarUser.userUUID) {
            rtcEngine.enableLocalAudio(avatarUser.mic);
        } else {
            rtcEngine.muteRemoteAudioStream(avatarUser.rtcUID, !avatarUser.mic);
        }
    }, [avatarUser.mic]);

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

    return canvas;
});
