import React from "react";
import classNames from "classnames";
import { Observer, observer } from "mobx-react-lite";
import { VideoAvatar, VideoAvatarProps } from "../../components/VideoAvatar";

import "./SmallClassAvatar.less";

export interface SmallClassAvatarProps extends Omit<VideoAvatarProps, "children"> {}

export const SmallClassAvatar = observer<SmallClassAvatarProps>(function SmallClassAvatar(props) {
    const { avatarUser } = props;
    return (
        <VideoAvatar {...props}>
            {(canvas, ctrlBtns) => (
                <Observer>
                    {() => (
                        <section
                            className={classNames("small-class-avatar-wrap", {
                                "with-video": avatarUser.camera,
                            })}
                        >
                            {canvas}
                            {!avatarUser.camera && (
                                <div className="small-class-avatar-background">
                                    <div
                                        className="video-avatar-background"
                                        style={{
                                            backgroundImage: `url(${avatarUser.avatar})`,
                                        }}
                                    ></div>
                                    <img src={avatarUser.avatar} alt="no camera" />
                                </div>
                            )}
                            <div className="small-class-avatar-ctrl-layer">
                                <h1 className="small-class-avatar-title">{avatarUser.name}</h1>
                                {ctrlBtns}
                            </div>
                        </section>
                    )}
                </Observer>
            )}
        </VideoAvatar>
    );
});

export default SmallClassAvatar;
