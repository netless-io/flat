import "./style.less";

import placeholderSVG from "./icons/placeholder.svg";

import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import classnames from "classnames";

export interface VideoAvatarAbsentProps {
    small?: boolean;
    isAvatarUserCreator: boolean;
}

export const VideoAvatarAbsent: FC<VideoAvatarAbsentProps> = ({ small, isAvatarUserCreator }) => {
    const { t } = useTranslation();
    return (
        <div className={classnames("video-avatar-absent", { "is-small": small })}>
            <img className="video-avatar-absent-img" draggable={false} src={placeholderSVG} />
            <span className="video-avatar-absent-content">
                {t(`${isAvatarUserCreator ? "teacher" : "student"}-left-temporarily`)}
            </span>
        </div>
    );
};
