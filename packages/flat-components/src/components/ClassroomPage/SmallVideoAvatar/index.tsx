import React from "react";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../VideoAvatar";
import "./style.less";

export type SmallVideoAvatarProps = VideoAvatarProps;

export const SmallVideoAvatar: React.FC<SmallVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "small-video-avatar")} />
);
