import React from "react";
import { OneToOneVideoAvatar, OneToOneVideoAvatarProps } from "flat-components";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/UserStore";
import { RtcRoom } from "../../apiMiddleware/rtc/room";

export interface OneToOneAvatarProps extends Omit<OneToOneVideoAvatarProps, "avatarUser"> {
    rtc: RtcRoom;
    avatarUser?: User | null;
}

export const OneToOneAvatar: React.FC<OneToOneAvatarProps> = ({
    avatarUser,
    rtc,
    ...restProps
}) => (
    <OneToOneVideoAvatar {...restProps} avatarUser={avatarUser}>
        {avatarUser && <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcRoom={rtc} />}
    </OneToOneVideoAvatar>
);

export default OneToOneAvatar;
