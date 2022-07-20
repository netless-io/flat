import React, { FC } from "react";
import {
    VideoAvatar,
    VideoAvatarAbsent,
    VideoAvatarAbsentProps,
    VideoAvatarProps,
} from "flat-components";
import { AvatarCanvas, AvatarCanvasProps } from "./AvatarCanvas";
export type RTCAvatarProps = Omit<VideoAvatarProps, "getVolumeLevel" | "avatarUser"> &
    VideoAvatarAbsentProps &
    AvatarCanvasProps;

export const RTCAvatar: FC<RTCAvatarProps> = ({
    userUUID,
    avatarUser,
    rtcAvatar,
    isAvatarUserCreator,
    small,
    isCreator,
    updateDeviceState,
}) => {
    return avatarUser ? (
        <AvatarCanvas avatarUser={avatarUser} rtcAvatar={rtcAvatar}>
            {(getVolumeLevel, canvas) => (
                <VideoAvatar
                    avatarUser={avatarUser}
                    getVolumeLevel={getVolumeLevel}
                    isCreator={isCreator}
                    small={small}
                    updateDeviceState={updateDeviceState}
                    userUUID={userUUID}
                >
                    {canvas}
                </VideoAvatar>
            )}
        </AvatarCanvas>
    ) : (
        <VideoAvatarAbsent isAvatarUserCreator={isAvatarUserCreator} small={small} />
    );
};
