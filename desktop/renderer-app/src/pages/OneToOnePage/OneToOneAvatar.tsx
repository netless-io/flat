import React from "react";
import { observer } from "mobx-react-lite";
import type AgoraSDK from "agora-electron-sdk";
import { OneToOneAvatar as OneToOneAvatarImpl } from "flat-components";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/UserStore";

export interface OneToOneAvatarProps {
    userUUID: string;
    isCreator: boolean;
    avatarUser: User;
    rtcEngine: AgoraSDK;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
}

export const OneToOneAvatar = observer<OneToOneAvatarProps>(function OneToOneAvatar(props) {
    return (
        <OneToOneAvatarImpl {...props}>
            <AvatarCanvas {...props} />
        </OneToOneAvatarImpl>
    );
});

export default OneToOneAvatar;
