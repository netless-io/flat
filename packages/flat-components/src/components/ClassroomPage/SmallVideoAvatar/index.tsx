import "./style.less";

import React from "react";
import { VideoAvatarProps, VideoAvatar } from "../VideoAvatar";
import classNames from "classnames";

export type SmallVideoAvatarProps = VideoAvatarProps;

export const SmallVideoAvatar: React.FC<SmallVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "small-video-avatar")} />
);
