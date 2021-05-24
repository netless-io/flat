import "./style.less";
import cameraSVG from "./icons/camera.svg";
import cameraDisabledSVG from "./icons/camera-disabled.svg";
import microphoneSVG from "./icons/microphone.svg";
import microphoneDisabledSVG from "./icons/microphone-disabled.svg";
import videoExpandSVG from "./icons/video-expand.svg";

import React from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";

export interface AvatarUser {
    name: string;
    userUUID: string;
    camera: boolean;
    mic: boolean;
    avatar: string;
}

export interface VideoAvatarProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    isCreator: boolean;
    userUUID: string;
    avatarUser?: AvatarUser | null;
    updateDeviceState(id: string, camera: boolean, mic: boolean): void;
    /** Mini avatar */
    mini?: boolean;
    /** When the expand button of mini avatar is clicked */
    onExpand?: () => void;
}

export const VideoAvatar = observer<VideoAvatarProps>(function VideoAvatar({
    isCreator,
    userUUID,
    avatarUser,
    children: canvas,
    updateDeviceState,
    mini,
    onExpand,
    className,
    ...restProps
}) {
    if (!avatarUser) {
        return (
            <div
                {...restProps}
                className={classNames(className, "video-avatar-wrap", "video-avatar-placeholder", {
                    "is-mini": mini,
                })}
            >
                老师暂时离开
            </div>
        );
    }

    const isCameraCtrlDisable =
        avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.camera);

    const isMicCtrlDisable = avatarUser.userUUID !== userUUID && (!isCreator || !avatarUser.mic);

    return (
        <div
            {...restProps}
            className={classNames(className, "video-avatar-wrap", { "is-mini": mini })}
        >
            {canvas}
            {!avatarUser.camera && (
                <div className="video-avatar-background">
                    <div
                        className="video-avatar-background-blur"
                        style={{
                            backgroundImage: `url(${avatarUser.avatar})`,
                        }}
                    />
                    <img
                        className="video-avatar-background-avatar"
                        src={avatarUser.avatar}
                        alt="no camera"
                    />
                </div>
            )}
            <div
                className={classNames("video-avatar-ctrl-layer", {
                    "with-video": avatarUser.camera,
                })}
            >
                {mini ? (
                    <button className="video-avatar-expand" onClick={onExpand}>
                        <img src={videoExpandSVG} alt="expand" />
                    </button>
                ) : (
                    <div className="video-avatar-ctrl-content">
                        <h1 className="video-avatar-user-name">{avatarUser.name}</h1>
                        <div className="video-avatar-ctrl-btns">
                            <button
                                onClick={() => {
                                    if (isCreator || userUUID === avatarUser.userUUID) {
                                        updateDeviceState(
                                            avatarUser.userUUID,
                                            !avatarUser.camera,
                                            avatarUser.mic,
                                        );
                                    }
                                }}
                                disabled={isCameraCtrlDisable}
                            >
                                <img
                                    src={avatarUser.camera ? cameraSVG : cameraDisabledSVG}
                                    alt="camera"
                                    width="22"
                                    height="22"
                                />
                            </button>
                            <button
                                onClick={() => {
                                    if (isCreator || userUUID === avatarUser.userUUID) {
                                        updateDeviceState(
                                            avatarUser.userUUID,
                                            avatarUser.camera,
                                            !avatarUser.mic,
                                        );
                                    }
                                }}
                                disabled={isMicCtrlDisable}
                            >
                                <img
                                    src={avatarUser.mic ? microphoneSVG : microphoneDisabledSVG}
                                    alt="microphone"
                                    width="22"
                                    height="22"
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
