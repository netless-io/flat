import "./AvatarCanvas.less";

import React, { useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { FlatRTCAvatar } from "@netless/flat-rtc";
import { User } from "../../stores/class-room-store";

export interface AvatarCanvasProps {
    /** the user of this avatar */
    avatarUser: User;
    rtcAvatar?: FlatRTCAvatar | null;
}

export const AvatarCanvas = observer<
    AvatarCanvasProps & {
        children: (
            getVolumeLevel: () => number,
            canvas: React.ReactNode,
        ) => React.ReactElement | null;
    }
>(function AvatarCanvas({ avatarUser, rtcAvatar, children }) {
    const getVolumeLevel = useCallback((): number => {
        return rtcAvatar?.getVolumeLevel() || 0;
    }, [rtcAvatar]);

    useEffect(() => {
        rtcAvatar?.enableCamera(avatarUser.camera);
    }, [rtcAvatar, avatarUser.camera]);

    useEffect(() => {
        rtcAvatar?.enableMic(avatarUser.mic);
    }, [rtcAvatar, avatarUser.mic]);

    useEffect(
        () => () => {
            rtcAvatar?.enableCamera(false);
            rtcAvatar?.enableMic(false);
        },
        [rtcAvatar],
    );

    const canvas = (
        <div ref={el => el && rtcAvatar?.setElement(el)} className="video-avatar-canvas" />
    );

    return children(getVolumeLevel, canvas);
});
