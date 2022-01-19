import React from "react";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../VideoAvatar";
import "./style.less";

export type BigVideoAvatarProps = VideoAvatarProps;

export const BigVideoAvatar: React.FC<BigVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "big-video-avatar")} />
);
