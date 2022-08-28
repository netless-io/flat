import "./style.less";

import placeholderSVG from "./icons/placeholder.svg";

import React, { FC } from "react";
import { useTranslate } from "@netless/flat-i18n";
import classnames from "classnames";
import { User } from "../../../types/user";

export interface VideoAvatarAbsentProps {
    avatarUser?: User | null;
    small?: boolean;
    isAvatarUserCreator: boolean;
}

export const VideoAvatarAbsent: FC<VideoAvatarAbsentProps> = ({ small, isAvatarUserCreator }) => {
    const t = useTranslate();
    return (
        <div className={classnames("video-avatar-absent", { "is-small": small })}>
            <img className="video-avatar-absent-img" draggable={false} src={placeholderSVG} />
            <span className="video-avatar-absent-content">
                {t(`${isAvatarUserCreator ? "teacher" : "student"}-left-temporarily`)}
            </span>
        </div>
    );
};
