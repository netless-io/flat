import React from "react";
import type AgoraSDK from "agora-electron-sdk";
import { SmallVideoAvatar, SmallVideoAvatarProps } from "flat-components";
import { User } from "../../stores/user-store";
import { AvatarCanvas } from "../../components/AvatarCanvas";

interface SmallClassAvatarProps extends Omit<SmallVideoAvatarProps, "avatarUser"> {
    rtcEngine: AgoraSDK;
    avatarUser?: User | null;
}

export const SmallClassAvatar: React.FC<SmallClassAvatarProps> = ({
    avatarUser,
    rtcEngine,
    ...restProps
}) => (
    <SmallVideoAvatar {...restProps} avatarUser={avatarUser}>
        {avatarUser && (
            <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcEngine={rtcEngine} />
        )}
    </SmallVideoAvatar>
);

export default SmallClassAvatar;
