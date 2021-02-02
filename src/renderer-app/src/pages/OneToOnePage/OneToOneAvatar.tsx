import React from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../../components/VideoAvatar";

import noCamera from "../../assets/image/no-camera.svg";

import "./OneToOneAvatar.less";

export interface OneToOneAvatarProps extends Omit<VideoAvatarProps, "children"> {}

export const OneToOneAvatar = observer<OneToOneAvatarProps>(function OneToOneAvatar({
    avatarUser,
    ...restProps
}) {
    return (
        <VideoAvatar {...restProps} avatarUser={avatarUser}>
            {(canvas, ctrlBtns) => (
                <section className="one-to-one-avatar-wrap">
                    {canvas}
                    {!avatarUser.camera && (
                        <div className="one-to-one-avatar-background">
                            <img src={noCamera} alt="no camera" />
                        </div>
                    )}
                    <div
                        className={classNames("one-to-one-avatar-ctrl-layer", {
                            "with-video": avatarUser.camera,
                        })}
                    >
                        <h1 className="one-to-one-avatar-title">{avatarUser.name}</h1>
                        {ctrlBtns}
                    </div>
                </section>
            )}
        </VideoAvatar>
    );
});

export default OneToOneAvatar;
