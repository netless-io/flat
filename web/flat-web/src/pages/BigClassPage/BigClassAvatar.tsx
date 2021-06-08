import { BigVideoAvatar } from "flat-components";
import { VideoAvatarProps } from "flat-components/src/components/ClassroomPage/VideoAvatar";
import React from "react";
import { RtcRoom } from "../../apiMiddleware/rtc/room";
import { AvatarCanvas } from "../../components/AvatarCanvas";
import { User } from "../../stores/UserStore";

interface BigClassAvatarProps extends Omit<VideoAvatarProps, "avatarUser"> {
    rtc: RtcRoom;
    avatarUser?: User | null;
}

export const BigClassAvatar: React.FC<BigClassAvatarProps> = ({
    avatarUser,
    rtc,
    ...restProps
}) => {
    return (
        <BigVideoAvatar {...restProps} avatarUser={avatarUser}>
            {avatarUser && <AvatarCanvas {...restProps} avatarUser={avatarUser} rtcRoom={rtc} />}
        </BigVideoAvatar>
    );
};

export default BigClassAvatar;
