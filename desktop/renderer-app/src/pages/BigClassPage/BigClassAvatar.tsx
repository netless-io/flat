import React, { useEffect } from "react";
import { Observer, observer } from "mobx-react-lite";
import classNames from "classnames";
import { VideoAvatar, VideoAvatarProps } from "../../components/VideoAvatar";

import videoExpandSVG from "../../assets/image/video-expand.svg";

import "./BigClassAvatar.less";

export interface BigClassAvatarProps extends Omit<VideoAvatarProps, "children"> {
    small?: boolean;
    onExpand?: () => void;
}

export const BigClassAvatar = observer<BigClassAvatarProps>(function BigClassAvatar({
    avatarUser,
    small,
    rtcEngine,
    onExpand,
    ...restProps
}) {
    useEffect(() => {
        if (avatarUser.camera) {
            rtcEngine.resizeRender(avatarUser.rtcUID, void 0);
        }
        // only listen to small changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [small]);

    return (
        <VideoAvatar {...restProps} avatarUser={avatarUser} rtcEngine={rtcEngine}>
            {(canvas, ctrlBtns) => (
                <Observer>
                    {() => (
                        <section
                            className={classNames("big-class-avatar-wrap", { "is-small": small })}
                        >
                            {canvas}
                            {!avatarUser.camera && (
                                <div className="big-class-avatar-background">
                                    <div
                                        className="video-avatar-background"
                                        style={{
                                            backgroundImage: `url(${avatarUser.avatar})`,
                                        }}
                                    />
                                    <img src={avatarUser.avatar} alt="no camera" />
                                </div>
                            )}
                            <div
                                className={classNames("big-class-avatar-ctrl-layer", {
                                    "with-video": avatarUser.camera,
                                })}
                            >
                                {small ? (
                                    <button className="big-class-avatar-expand" onClick={onExpand}>
                                        <img src={videoExpandSVG} alt="expand" />
                                    </button>
                                ) : (
                                    <>
                                        <h1 className="big-class-avatar-title">
                                            {avatarUser.name}
                                        </h1>
                                        {ctrlBtns}
                                    </>
                                )}
                            </div>
                        </section>
                    )}
                </Observer>
            )}
        </VideoAvatar>
    );
});

export default BigClassAvatar;
