import React from "react";
import classNames from "classnames";
import { Observer, observer } from "mobx-react-lite";
import { VideoAvatar, VideoAvatarProps } from "../../components/VideoAvatar";

import noCameraSmall from "../../assets/image/no-camera-small.svg";

import "./SmallClassAvatar.less";

export interface SmallClassAvatarProps extends Omit<VideoAvatarProps, "children"> {}

export const SmallClassAvatar = observer<SmallClassAvatarProps>(function SmallClassAvatar(props) {
    return (
        <VideoAvatar {...props}>
            {(canvas, ctrlBtns) => (
                <Observer>
                    {() => (
                        <section
                            className={classNames("small-class-avatar-wrap", {
                                "with-video": props.avatarUser.camera,
                            })}
                        >
                            {canvas}
                            <div className="small-class-avatar-ctrl-layer">
                                <img
                                    className="small-class-avatar-no-camera"
                                    src={noCameraSmall}
                                    alt="no camera"
                                />
                                <h1 className="small-class-avatar-title">
                                    {props.avatarUser.name}
                                </h1>
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
