import "./AvatarCanvas.less";

import React, { useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useUpdateEffect } from "react-use";
import type { Rtc } from "../../api-middleware/rtc";
import { User } from "../../stores/class-room-store";

export interface AvatarCanvasProps {
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser: User;
    rtc: Rtc;
}

export const AvatarCanvas = observer<
    AvatarCanvasProps & {
        children: (
            getVolumeLevel: () => number,
            canvas: React.ReactNode,
        ) => React.ReactElement | null;
    }
>(function AvatarCanvas({ userUUID, avatarUser, rtc, children }) {
    const rtcEngine = rtc.rtcEngine;

    /** avatar element */
    const elRef = useRef<HTMLDivElement | null>(null);

    const getVolumeLevel = useCallback((): number => {
        return rtc.getVolumeLevel(avatarUser.rtcUID);
    }, [rtc, avatarUser.rtcUID]);

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
            className="video-avatar-canvas"
        />
    );

    return children(getVolumeLevel, canvas);
});
