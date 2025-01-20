import "./style.less";

import Placeholder from "./icons/Placeholder";

import classnames from "classnames";
import React, { FC, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslate } from "@netless/flat-i18n";
import { User } from "../../../types/user";
import { DarkModeContext } from "../../FlatThemeProvider";

export interface VideoAvatarAbsentProps {
    avatarUser?: User | null;
    small?: boolean;
    /** Is current user room creator */
    isCreator: boolean;
    /** Is `avatarUser` room creator */
    isAvatarUserCreator: boolean;

    portal?: HTMLElement | null;
    onDoubleClick?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    isDropTarget?: boolean;
    isAI?: boolean;

    generateAvatar?: (uid: string) => string;
}

export const VideoAvatarAbsent: FC<VideoAvatarAbsentProps> = ({
    isAI,
    avatarUser,
    small,
    isCreator,
    isAvatarUserCreator,
    portal,
    onDoubleClick,
    onDragStart,
    onDragEnd,
    isDropTarget,
    generateAvatar,
}) => {
    const t = useTranslate();
    const isDark = useContext(DarkModeContext);

    const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);

    const avatar =
        generateAvatar && (isAvatarLoadFailed || !avatarUser)
            ? generateAvatar(avatarUser?.userUUID ?? "")
            : avatarUser?.avatar;

    const onDragStartImpl = (ev: React.DragEvent<HTMLDivElement>): void => {
        if (!avatarUser) {
            return;
        }
        const rect = ev.currentTarget.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        const y = (ev.clientY - rect.top) / rect.height;
        ev.dataTransfer.setData("video-avatar", JSON.stringify([avatarUser.userUUID, x, y]));
        ev.dataTransfer.effectAllowed = "move";
        onDragStart && onDragStart();
    };

    const absentView = avatarUser ? (
        <div
            className={classnames("video-avatar", {
                "is-small": small && !portal,
                "is-drop-target": isDropTarget,
            })}
            data-user-uuid={avatarUser.userUUID}
            draggable={isCreator && !portal && !!isDropTarget && !isAI}
            onDoubleClick={portal ? undefined : onDoubleClick}
            onDragEnd={onDragEnd}
            onDragStart={onDragStartImpl}
        >
            <div
                className="video-avatar-image-blur-bg"
                style={{ backgroundImage: `url(${avatar})` }}
            />
            <img
                alt={avatarUser.name}
                className="video-avatar-image"
                draggable={false}
                src={avatar}
                onError={() => avatar && setAvatarLoadFailed(true)}
            />
            <div className="video-avatar-bottom">
                <h1 className="video-avatar-user-name" title={avatarUser.name}>
                    {avatarUser.name}
                </h1>
            </div>
            <div className="video-avatar-is-left">{t("has-left")}</div>
        </div>
    ) : null;

    return portal ? (
        <div
            className={classnames("video-avatar-absent", {
                "is-small": small,
                "is-drop-target": isDropTarget,
            })}
            data-user-uuid={avatarUser?.userUUID}
        >
            <div className="video-avatar-absent-block">
                <Placeholder className="video-avatar-absent-img" isDark={isDark} />
                <span className="video-avatar-absent-content">
                    {isAvatarUserCreator ? (
                        t("teacher-left-temporarily")
                    ) : avatarUser ? (
                        <>
                            <span className="video-avatar-absent-name">{avatarUser.name}</span>
                            <span className="video-avatar-absent-desc">
                                {t("user-left-temporarily")}
                            </span>
                        </>
                    ) : (
                        t("student-left-temporarily")
                    )}
                </span>
            </div>
            {absentView && portal && createPortal(absentView, portal)}
        </div>
    ) : (
        absentView
    );
};

export interface VideoAIAvatarAbsentProps {
    avatarUser?: User | null;
    small?: boolean;
    portal?: HTMLElement | null;
    onDoubleClick?: () => void;
}
export const VideoAIAvatarAbsent: FC<VideoAIAvatarAbsentProps> = ({
    portal,
    avatarUser,
    small,
    onDoubleClick,
}) => {
    const t = useTranslate();
    const isDark = useContext(DarkModeContext);

    if (!avatarUser) {
        return null;
    }

    const absentView = (
        <div
            className={classnames("video-avatar", {
                "is-small": small,
                "is-drop-target": false,
            })}
            data-user-uuid={avatarUser.userUUID}
            onDoubleClick={onDoubleClick}
        >
            <div
                className="video-avatar-image-blur-bg  no-filter"
                style={{ backgroundImage: `url(${avatarUser.avatar})` }}
            />
            <div className="video-avatar-bottom">
                <h1 className="video-avatar-user-name" title={avatarUser.name}>
                    {avatarUser.name}
                </h1>
            </div>
            <div className="video-avatar-is-left">{t("has-left")}</div>
        </div>
    );

    return portal ? (
        <div
            className={classnames("video-avatar-absent", {
                "is-small": small,
            })}
            data-user-uuid={avatarUser?.userUUID}
        >
            <div className="video-avatar-absent-block">
                <Placeholder className="video-avatar-absent-img" isDark={isDark} />
                <span className="video-avatar-absent-content">
                    <span className="video-avatar-absent-name">{avatarUser.name}</span>
                    <span className="video-avatar-absent-desc">{t("user-left-temporarily")}</span>
                </span>
            </div>
            {absentView && portal && createPortal(absentView, portal)}
        </div>
    ) : (
        absentView
    );
};
