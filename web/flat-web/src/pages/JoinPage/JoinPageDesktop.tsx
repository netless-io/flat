/* eslint react/jsx-no-target-blank: off */
import logoSVG from "./icons/logo.svg";
import downloadSVG from "./icons/download.svg";
import joinSVG from "./icons/join.svg";

import React, { useMemo } from "react";
import { Avatar, Button } from "antd";
import { useTranslation } from "react-i18next";

import { RouteNameType, usePushHistory } from "../../utils/routes";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";

export interface JoinPageDesktopProps {
    isLogin: boolean;
    avatar: string;
    roomUUID: string;
    privacyURL: string;
    serviceURL: string;
    joinRoom: () => void;
}

export default function JoinPageDesktop({
    isLogin,
    avatar,
    roomUUID,
    privacyURL,
    serviceURL,
    joinRoom,
}: JoinPageDesktopProps): React.ReactElement {
    const { t } = useTranslation();
    const pushHistory = usePushHistory();

    const url = useMemo(() => `x-agora-flat-client://joinRoom?roomUUID=${roomUUID}`, [roomUUID]);

    return (
        <div className="join-page-container">
            <iframe height="0" src={url} style={{ display: "none" }} title="[hidden]" width="0" />
            <div className="join-page-header-container">
                <img alt="app logo" src={logoSVG} />
                {isLogin ? (
                    <Avatar
                        className="join-page-header-avatar"
                        icon={<img src={avatar} />}
                        size={32}
                    />
                ) : (
                    <div
                        className="join-page-header-btn"
                        onClick={() => {
                            if (roomUUID) {
                                sessionStorage.setItem("roomUUID", roomUUID);
                                pushHistory(RouteNameType.LoginPage);
                            }
                        }}
                    >
                        {t("login")}
                    </div>
                )}
            </div>
            <div className="join-page-content-container">
                <div className="join-page-content-title">{t("select-the-way-to-join-room")}</div>
                <div className="join-page-content-btn-container">
                    <Button
                        className="join-page-content-btn"
                        onClick={() => window.open(FLAT_DOWNLOAD_URL, "_blank")}
                    >
                        <img alt="download icon" src={downloadSVG} />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">
                                {t("download-desktop-application")}
                            </div>
                            <span className="join-page-content-sub-text">
                                {t("download-desktop-application-tips")}
                            </span>
                        </div>
                    </Button>
                    <Button className="join-page-content-btn" onClick={joinRoom}>
                        <img alt="join icon" src={joinSVG} />
                        <div className="join-page-content-text-container">
                            <div className="join-page-content-text">
                                {t("web-version-join-room")}
                            </div>
                            <span className="join-page-content-sub-text">
                                {t("web-version-join-room-tips")}
                            </span>
                        </div>
                    </Button>
                </div>
                <div className="join-page-content-divider">
                    <span>{t("or")}</span>
                </div>
                <div className="join-page-content-container-open-flat">
                    <span>{t("already-installed-tips")}</span>
                    <a href={url}>{t("open-now")}</a>
                </div>
            </div>
            <div className="join-page-footer-container">
                <a href={privacyURL} rel="noreferrer" target="_blank">
                    {t("privacy-agreement")}
                </a>
                <span>｜</span>
                <a href={serviceURL} rel="noreferrer" target="_blank">
                    {t("service-policy")}
                </a>
            </div>
        </div>
    );
}
