import "./AvatarCanvas.less";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { RtcAvatar, RtcEvents } from "../../api-middleware/rtc/avatar";
import { RtcRoom } from "../../api-middleware/rtc/room";
import { User } from "../../stores/class-room-store";

export interface AvatarCanvasProps {
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser?: User | null;
    rtcRoom: RtcRoom;
}

export const AvatarCanvas = observer<
    AvatarCanvasProps & {
        children: (
            getVolumeLevel: () => number,
            canvas: React.ReactNode,
        ) => React.ReactElement | null;
    }
>(function AvatarCanvas({ userUUID, avatarUser, rtcRoom, children }) {
    const camera = avatarUser?.camera;
    const mic = avatarUser?.mic;

    const { t } = useTranslation();

    const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);

    const rtcAvatar = useMemo(() => {
        return avatarUser ? new RtcAvatar({ rtc: rtcRoom, userUUID, avatarUser }) : null;
    }, [rtcRoom, userUUID, avatarUser]);

    useEffect(() => () => rtcAvatar?.destroy(), [rtcAvatar]);

    const getVolumeLevel = useCallback((): number => {
        return rtcAvatar?.audioTrack?.getVolumeLevel() || 0;
    }, [rtcAvatar]);

    useEffect(() => {
        if (rtcAvatar) {
            rtcAvatar.element = canvasEl;
        }
    }, [canvasEl, rtcAvatar]);

    useEffect(() => {
        if (rtcAvatar && typeof camera === "boolean") {
            void rtcAvatar.setCamera(camera);
        }
    }, [camera, rtcAvatar]);

    useEffect(() => {
        if (rtcAvatar && typeof mic === "boolean") {
            void rtcAvatar.setMic(mic);
        }
    }, [mic, rtcAvatar]);

    useEffect(() => {
        if (!rtcAvatar) {
            return;
        }

        const handleSetCameraError = (error: Error): void => {
            console.log("[rtc] set camera error", error);
            void message.error(t("set-camera-error"));
        };
        rtcAvatar.on(RtcEvents.SetCameraError, handleSetCameraError);

        const handlerSetMicError = (error: Error): void => {
            console.log("[rtc] set microphone error", error);
            void message.error(t("set-mic-error"));
        };
        rtcAvatar.on(RtcEvents.SetMicError, handlerSetMicError);

        const handleLowVolume = (): void => {
            console.log("[rtc] low volume");
            void message.warn(t("low-volume"));
        };
        rtcAvatar.on(RtcEvents.LowVolume, handleLowVolume);

        return () => {
            rtcAvatar.off(RtcEvents.SetCameraError, handleSetCameraError);
            rtcAvatar.off(RtcEvents.SetMicError, handlerSetMicError);
            rtcAvatar.off(RtcEvents.LowVolume, handleLowVolume);
        };
    }, [rtcAvatar, t]);

    const canvas = <div ref={setCanvasEl} className="video-avatar-canvas" />;

    return children(getVolumeLevel, canvas);
});
