import "./AvatarCanvas.less";

import React, { useEffect, useState } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { RtcAvatar, RtcEvents } from "../apiMiddleware/rtc/avatar";
import { RtcRoom } from "../apiMiddleware/rtc/room";
import { User } from "../stores/ClassRoomStore";

export interface AvatarCanvasProps {
    isCreator: boolean;
    /** id of current login user */
    userUUID: string;
    /** the user of this avatar */
    avatarUser: User;
    rtcRoom: RtcRoom;
    updateDeviceState: (id: string, camera: boolean, mic: boolean) => void;
}

export const AvatarCanvas = observer<AvatarCanvasProps>(function AvatarCanvas({
    userUUID,
    avatarUser,
    rtcRoom,
}) {
    const { t } = useTranslation();
    const [rtcAvatar] = useState(() => new RtcAvatar({ rtc: rtcRoom, userUUID, avatarUser }));

    useEffect(() => {
        void rtcAvatar.setCamera(avatarUser.camera);
    }, [avatarUser.camera, rtcAvatar]);

    useEffect(() => {
        void rtcAvatar.setMic(avatarUser.mic);
    }, [avatarUser.mic, rtcAvatar]);

    useEffect(() => {
        rtcAvatar.on(RtcEvents.SetCameraError, (error: Error) => {
            console.log("[rtc] set camera error", error);
            void message.error(t("set-camera-error"));
        });
        rtcAvatar.on(RtcEvents.SetMicError, (error: Error) => {
            console.log("[rtc] set microphone error", error);
            void message.error(t("set-mic-error"));
        });
        rtcAvatar.on(RtcEvents.LowVolume, () => {
            console.log("[rtc] low volume");
            void message.warn(t("low-volume"));
        });
        return () => void rtcAvatar.destroy();
    }, [rtcAvatar, t]);

    const canvas = (
        <div
            className="video-avatar-canvas"
            ref={el => {
                rtcAvatar.element = el ?? void 0;
            }}
        />
    );

    return canvas;
});
