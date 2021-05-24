import "./style.less";

import React from "react";
import { VideoAvatarProps, VideoAvatar } from "../VideoAvatar";
import classNames from "classnames";

export type BigVideoAvatarProps = VideoAvatarProps;

export const BigVideoAvatar: React.FC<BigVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "big-video-avatar")} />
);
