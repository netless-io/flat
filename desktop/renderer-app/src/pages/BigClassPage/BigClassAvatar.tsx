import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import type AgoraSDK from "agora-electron-sdk";
import { BigClassAvatar as BigClassAvatarImpl } from "flat-components";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/UserStore";

interface BigClassAvatarProps {
    userUUID: string;
    isCreator: boolean;
    avatarUser: User;
    small?: boolean;
    rtcEngine: AgoraSDK;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
    onExpand: () => void;
}

export const BigClassAvatar = observer<BigClassAvatarProps>(function BigClassAvatar({
    avatarUser,
    small,
    rtcEngine,
    ...restProps
}) {
    useEffect(() => {
        if (avatarUser.camera) {
            rtcEngine.resizeRender(avatarUser.rtcUID, void 0);
        }
        // only listen to small changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [small]);

    return (
        <BigClassAvatarImpl {...restProps} small={small} avatarUser={avatarUser}>
            <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcEngine={rtcEngine} />
        </BigClassAvatarImpl>
    );
});

export default BigClassAvatar;
