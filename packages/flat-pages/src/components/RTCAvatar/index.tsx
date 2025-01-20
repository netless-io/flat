import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import {
    VideoAvatar,
    VideoAvatarAbsent,
    VideoAvatarAbsentProps,
    VideoAvatarProps,
} from "flat-components";
import { AvatarCanvas, AvatarCanvasProps } from "./AvatarCanvas";
import { generateAvatar } from "../../utils/generate-avatar";
export type RTCAvatarProps = Omit<
    VideoAvatarProps,
    "getVolumeLevel" | "avatarUser" | "portal" | "generateAvatar"
> &
    VideoAvatarAbsentProps &
    AvatarCanvasProps & {
        getPortal: (userUUID: string) => HTMLElement | undefined;
        isAI?: boolean;
        chatSlot?: React.ReactNode;
    };

export const RTCAvatar: FC<RTCAvatarProps> = /* @__PURE__ */ observer<RTCAvatarProps>(
    function RTCAvatar({
        isAI,
        chatSlot,
        userUUID,
        avatarUser,
        rtcAvatar,
        isAvatarUserCreator,
        small,
        isCreator,
        isDropTarget,
        onDoubleClick,
        getPortal,
        onDragStart,
        onDragEnd,
        updateDeviceState,
    }) {
        return avatarUser && !avatarUser.hasLeft ? (
            <AvatarCanvas avatarUser={avatarUser} rtcAvatar={rtcAvatar}>
                {(getVolumeLevel, canvas) => (
                    <VideoAvatar
                        avatarUser={avatarUser}
                        chatSlot={chatSlot}
                        generateAvatar={generateAvatar}
                        getVolumeLevel={getVolumeLevel}
                        isAI={isAI}
                        isCreator={isCreator}
                        isDropTarget={isDropTarget}
                        portal={getPortal(avatarUser.userUUID)}
                        small={small}
                        updateDeviceState={updateDeviceState}
                        userUUID={userUUID}
                        onDoubleClick={onDoubleClick}
                        onDragEnd={onDragEnd}
                        onDragStart={onDragStart}
                    >
                        {canvas}
                    </VideoAvatar>
                )}
            </AvatarCanvas>
        ) : (
            <VideoAvatarAbsent
                avatarUser={avatarUser}
                generateAvatar={generateAvatar}
                isAI={isAI}
                isAvatarUserCreator={isAvatarUserCreator}
                isCreator={isCreator}
                isDropTarget={isDropTarget}
                portal={avatarUser && getPortal(avatarUser.userUUID)}
                small={small}
                onDoubleClick={onDoubleClick}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
            />
        );
    },
);
