import "./style.less";

import React from "react";
import classnames from "classnames";
import { createPortal } from "react-dom";
import { useTranslate } from "@netless/flat-i18n";
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

    portal?: HTMLElement;
    onDoubleClick?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    isDropTarget?: boolean;
}

export const VideoAvatar: React.FC<VideoAvatarProps> = ({
    portal,
    small,
    avatarUser,
    isCreator,
    isDropTarget,
    userUUID,
    updateDeviceState,
    getVolumeLevel,
    onDoubleClick,
    onDragStart,
    onDragEnd,
    children,
}) => {
    const t = useTranslate();

    const isCameraCtrlDisable = !isCreator && avatarUser.userUUID !== userUUID;

    const isMicCtrlDisable = !isCreator && avatarUser.userUUID !== userUUID;

    const onDragStartImpl = (ev: React.DragEvent<HTMLDivElement>): void => {
        const rect = ev.currentTarget.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        const y = (ev.clientY - rect.top) / rect.height;
        ev.dataTransfer.setData("video-avatar", JSON.stringify([avatarUser.userUUID, x, y]));
        ev.dataTransfer.effectAllowed = "move";
        onDragStart && onDragStart();
    };

    const view = (
        <div
            className={classnames("video-avatar", {
                "is-small": small && !portal,
                "is-drop-target": isDropTarget,
            })}
            data-user-uuid={avatarUser.userUUID}
            draggable={isCreator && !portal}
            onDoubleClick={portal ? undefined : onDoubleClick}
            onDragEnd={onDragEnd}
            onDragStart={onDragStartImpl}
        >
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
                <div
                    className={classnames("video-avatar-media-ctrl", {
                        "is-portal": portal,
                    })}
                >
                    <button
                        className={classnames("video-avatar-media-ctrl-btn", {
                            "is-muted": !avatarUser.camera,
                            "is-small": small && !portal,
                        })}
                        disabled={isCameraCtrlDisable}
                        title={t("camera")}
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
                            "is-small": small && !portal,
                        })}
                        disabled={isMicCtrlDisable}
                        title={t("microphone")}
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

    return portal ? (
        <div
            className={classnames("video-avatar", "video-avatar-holder", {
                "is-small": small,
                "is-drop-target": isDropTarget,
            })}
            data-user-uuid={avatarUser.userUUID}
        >
            <span className="video-avatar-holder-name">{avatarUser.name}</span>
            {createPortal(view, portal)}
        </div>
    ) : (
        view
    );
};
