import "./AvatarCanvas.less";

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { RtcAvatar } from "../apiMiddleware/rtc/avatar";
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
    const [rtcAvatar] = useState(() => new RtcAvatar({ rtc: rtcRoom, userUUID, avatarUser }));

    useEffect(() => {
        rtcAvatar.setCamera(avatarUser.camera);
    }, [avatarUser.camera, rtcAvatar]);

    useEffect(() => {
        rtcAvatar.setMic(avatarUser.mic);
    }, [avatarUser.mic, rtcAvatar]);

    useEffect(
        () => () => {
            rtcAvatar.destroy();
        },
        [rtcAvatar],
    );

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
