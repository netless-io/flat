import React, { useEffect } from "react";
import type AgoraSDK from "agora-electron-sdk";
import { BigVideoAvatar } from "flat-components";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/user-store";
import { VideoAvatarProps } from "flat-components/src/components/ClassroomPage/VideoAvatar";

interface BigClassAvatarProps extends Omit<VideoAvatarProps, "avatarUser"> {
    rtcEngine: AgoraSDK;
    avatarUser?: User | null;
}

export const BigClassAvatar: React.FC<BigClassAvatarProps> = ({
    avatarUser,
    rtcEngine,
    ...restProps
}) => {
    useEffect(() => {
        if (avatarUser?.camera) {
            rtcEngine.resizeRender(avatarUser.rtcUID, void 0);
        }
        // only listen to small changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restProps.mini]);

    return (
        <BigVideoAvatar {...restProps} avatarUser={avatarUser}>
            {avatarUser && (
                <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcEngine={rtcEngine} />
            )}
        </BigVideoAvatar>
    );
};

export default BigClassAvatar;
