import React from "react";
import { SmallVideoAvatar, SmallVideoAvatarProps } from "flat-components";
import { User } from "../../stores/user-store";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { RtcRoom } from "../../api-middleware/rtc/room";

interface SmallClassAvatarProps extends Omit<SmallVideoAvatarProps, "avatarUser"> {
    rtc: RtcRoom;
    avatarUser?: User | null;
}

export const SmallClassAvatar: React.FC<SmallClassAvatarProps> = ({
    avatarUser,
    rtc,
    ...restProps
}) => (
    <SmallVideoAvatar {...restProps} avatarUser={avatarUser}>
        {avatarUser && <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcRoom={rtc} />}
    </SmallVideoAvatar>
);

export default SmallClassAvatar;
