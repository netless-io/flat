import React from "react";
import { observer } from "mobx-react-lite";
import type AgoraSDK from "agora-electron-sdk";
import { SmallClassAvatar as SmallClassAvatarImpl } from "flat-components";
import { User } from "../../stores/UserStore";
import { AvatarCanvas } from "../../components/AvatarCanvas";

interface SmallClassAvatarProps {
    userUUID: string;
    isCreator: boolean;
    avatarUser: User;
    rtcEngine: AgoraSDK;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
}

export const SmallClassAvatar = observer<SmallClassAvatarProps>(function SmallClassAvatar(props) {
    return (
        <SmallClassAvatarImpl {...props}>
            <AvatarCanvas {...props} />
        </SmallClassAvatarImpl>
    );
});

export default SmallClassAvatar;
