import "./AvatarCanvas.less";

import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { IServiceVideoChatAvatar } from "@netless/flat-services";

import { User } from "@netless/flat-stores";

export interface AvatarCanvasProps {
    /** the user of this avatar */
    avatarUser?: User | null;
    rtcAvatar?: IServiceVideoChatAvatar | null;
}

export const AvatarCanvas = observer<
    AvatarCanvasProps & {
        children: (
            getVolumeLevel: () => number,
            canvas: React.ReactNode,
        ) => React.ReactElement | null;
    }
>(function AvatarCanvas({ avatarUser, rtcAvatar, children }) {
    const camera = avatarUser?.camera;
    const mic = avatarUser?.mic;

    const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);

    const getVolumeLevel = useCallback((): number => {
        return rtcAvatar?.getVolumeLevel() || 0;
    }, [rtcAvatar]);

    useEffect(() => {
        if (rtcAvatar) {
            rtcAvatar.setElement(canvasEl);
        }
    }, [canvasEl, rtcAvatar]);

    useEffect(
        () => () => {
            if (rtcAvatar) {
                rtcAvatar.setElement(null);
                rtcAvatar.enableCamera(false);
                rtcAvatar.enableMic(false);
            }
        },
        [rtcAvatar],
    );

    useEffect(() => {
        if (rtcAvatar) {
            rtcAvatar.enableCamera(Boolean(camera));
        }
    }, [camera, rtcAvatar]);

    useEffect(() => {
        if (rtcAvatar) {
            rtcAvatar.enableMic(Boolean(mic));
        }
    }, [mic, rtcAvatar]);

    const canvas = <div ref={setCanvasEl} className="video-avatar-canvas" />;

    return children(getVolumeLevel, canvas);
});
