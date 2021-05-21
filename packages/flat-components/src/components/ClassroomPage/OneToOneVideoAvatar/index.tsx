import "./style.less";

import React from "react";
import { VideoAvatar, VideoAvatarProps } from "../VideoAvatar";
import classNames from "classnames";

export type OneToOneVideoAvatarProps = VideoAvatarProps;

export const OneToOneVideoAvatar: React.FC<OneToOneVideoAvatarProps> = props => (
    <VideoAvatar {...props} className={classNames(props.className, "one-to-one-video-avatar")} />
);
