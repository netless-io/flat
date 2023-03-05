import "./style.less";

import Placeholder from "./icons/Placeholder";

import React, { FC, useContext } from "react";
import { useTranslate } from "@netless/flat-i18n";
import classnames from "classnames";
import { User } from "../../../types/user";
import { DarkModeContext } from "../../FlatThemeProvider";

export interface VideoAvatarAbsentProps {
    avatarUser?: User | null;
    small?: boolean;
    isAvatarUserCreator: boolean;
}

export const VideoAvatarAbsent: FC<VideoAvatarAbsentProps> = ({
    avatarUser,
    small,
    isAvatarUserCreator,
}) => {
    const t = useTranslate();
    const isDark = useContext(DarkModeContext);

    return (
        <div
            className={classnames("video-avatar-absent", { "is-small": small })}
            data-user-uuid="[object Object]"
        >
            <div className="video-avatar-absent-block">
                <Placeholder className="video-avatar-absent-img" isDark={isDark} />
                <span className="video-avatar-absent-content">
                    {isAvatarUserCreator
                        ? t("teacher-left-temporarily")
                        : avatarUser
                        ? t("user-left-temporarily", { name: avatarUser.name })
                        : t("student-left-temporarily")}
                </span>
            </div>
        </div>
    );
};
