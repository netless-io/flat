import "./style.less";

import React from "react";
import classnames from "classnames";
import { IconMic } from "./IconMic";
import { SVGCamera, SVGCameraMute, SVGMicrophoneMute } from "../../FlatIcons";

export interface VideoAvatarUser {
    name: string;
    userUUID: string;
    camera: boolean;
    mic: boolean;
    avatar: string;
}

export interface VideoAvatarProps {
    small?: boolean;
    /** Avatar user UUID */
    avatarUser: VideoAvatarUser;
    /** Is current user room creator */
    isCreator: boolean;
    /** Current user UUID */
    userUUID: string;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
    getVolumeLevel?: () => number;
}

export const VideoAvatar: React.FC<VideoAvatarProps> = ({
    small,
    avatarUser,
    isCreator,
    userUUID,
    updateDeviceState,
    getVolumeLevel,
    children,
}) => {
    const isCameraCtrlDisable =
        avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.camera);

    const isMicCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.mic);

    return (
        <div className={classnames("video-avatar", { "is-small": small })}>
            <div className="video-avatar-video">{children}</div>
            {(!children || !avatarUser.camera) && (
                <div className="video-avatar-image-container">
                    <div
                        className="video-avatar-image-blur-bg"
                        style={{ backgroundImage: `url(${avatarUser.avatar})` }}
                    />
                    <img
                        alt={avatarUser.name}
                        className="video-avatar-image"
                        draggable={false}
                        src={avatarUser.avatar}
                    />
                </div>
            )}
            <div className="video-avatar-bottom">
                <h1 className="video-avatar-user-name" title={avatarUser.name}>
                    {avatarUser.name}
                </h1>
                <div className="video-avatar-media-ctrl">
                    <button
                        className={classnames("video-avatar-media-ctrl-btn", {
                            "is-muted": !avatarUser.camera,
                        })}
                        disabled={isCameraCtrlDisable}
                        onClick={() => {
                            if (isCreator || userUUID === avatarUser.userUUID) {
                                updateDeviceState(
                                    avatarUser.userUUID,
                                    !avatarUser.camera,
                                    avatarUser.mic,
                                );
                            }
                        }}
                    >
                        {avatarUser.camera ? <SVGCamera /> : <SVGCameraMute />}
                    </button>
                    <button
                        className={classnames("video-avatar-media-ctrl-btn", {
                            "is-muted": !avatarUser.mic,
                        })}
                        disabled={isMicCtrlDisable}
                        onClick={() => {
                            if (isCreator || userUUID === avatarUser.userUUID) {
                                updateDeviceState(
                                    avatarUser.userUUID,
                                    avatarUser.camera,
                                    !avatarUser.mic,
                                );
                            }
                        }}
                    >
                        {avatarUser.mic ? (
                            <IconMic getVolumeLevel={getVolumeLevel} />
                        ) : (
                            <SVGMicrophoneMute />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
