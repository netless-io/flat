import React from "react";
import type AgoraSDK from "agora-electron-sdk";
import { OneToOneVideoAvatar, OneToOneVideoAvatarProps } from "flat-components";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/user-store";

export interface OneToOneAvatarProps extends Omit<OneToOneVideoAvatarProps, "avatarUser"> {
    rtcEngine: AgoraSDK;
    avatarUser?: User | null;
}

export const OneToOneAvatar: React.FC<OneToOneAvatarProps> = ({
    avatarUser,
    rtcEngine,
    ...restProps
}) => (
    <OneToOneVideoAvatar {...restProps} avatarUser={avatarUser}>
        {avatarUser && (
            <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcEngine={rtcEngine} />
        )}
    </OneToOneVideoAvatar>
);

export default OneToOneAvatar;
