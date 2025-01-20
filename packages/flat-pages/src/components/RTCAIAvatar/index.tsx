import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import {
    VideoAIAvatar,
    VideoAIAvatarAbsent,
    VideoAvatarAbsentProps,
    VideoAvatarProps,
} from "flat-components";
export type RTCAIAvatarProps = Pick<VideoAvatarProps, "small" | "onDoubleClick"> &
    Pick<VideoAvatarAbsentProps, "avatarUser"> & {
        getPortal: (userUUID: string) => HTMLElement | undefined;
        chatSlot?: React.ReactNode;
    };

export const RTCAIAvatar: FC<RTCAIAvatarProps> = /* @__PURE__ */ observer<RTCAIAvatarProps>(
    function RTCAvatar({ avatarUser, getPortal, small, onDoubleClick, chatSlot }) {
        return avatarUser && !avatarUser.hasLeft ? (
            <VideoAIAvatar
                avatarUser={avatarUser}
                chatSlot={chatSlot}
                portal={getPortal(avatarUser.userUUID)}
                small={small}
                onDoubleClick={onDoubleClick}
            />
        ) : (
            <VideoAIAvatarAbsent
                avatarUser={avatarUser}
                portal={avatarUser && getPortal(avatarUser.userUUID)}
                small={small}
                onDoubleClick={onDoubleClick}
            />
        );
    },
);
