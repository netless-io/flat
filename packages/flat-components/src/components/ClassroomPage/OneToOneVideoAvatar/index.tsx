import React from "react";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../VideoAvatar";
import "./style.less";

export type OneToOneVideoAvatarProps = VideoAvatarProps;

export const OneToOneVideoAvatar: React.FC<OneToOneVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "one-to-one-video-avatar")} />
);
