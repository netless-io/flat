import "../JoinPage/style.less";

import logoSVG from "../JoinPage/icons/logo-sm.svg";
import openInBrowserSVG from "../JoinPage/icons/open-in-browser.svg";

import React from "react";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import {
    FLAT_DOWNLOAD_URL,
    PRIVACY_URL,
    PRIVACY_URL_CN,
    SERVICE_URL,
    SERVICE_URL_CN,
} from "../constants/process";
import { useState } from "react";

// This is a simplified version of JoinPageMobile.tsx, it can not join room.
export const WeChatRedirect = (): React.ReactElement => {
    const t = useTranslate();
    const language = useLanguage();
    const [openCount, setOpenCount] = useState(0);

    const privacyURL = language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    const openApp = (): void => {
        window.location.href = "x-agora-flat-client://active";
        setOpenCount(openCount + 1);
    };

    const download = (): void => {
        window.location.href = FLAT_DOWNLOAD_URL;
    };

    return (
        <div className="join-page-mobile-container">
            <div className="join-page-mobile-effect"></div>
            <div className="join-page-mobile-header">
                <div className="join-page-mobile-app-icon">
                    <img alt="flat-logo" src={logoSVG} />
                </div>
            </div>
            <div className="join-page-mobile-big-btns">
                <button className="join-page-mobile-big-btn" onClick={openApp}>
                    {t("open")} {t("app-name")}
                </button>
                <button className="join-page-mobile-big-btn secondary" onClick={download}>
                    {t("download")} {t("app-name")}
                </button>
            </div>
            <div className="join-page-mobile-footer">
                <a href={privacyURL} rel="noreferrer" target="_blank">
                    {t("privacy-agreement")}
                </a>
                <span>｜</span>
                <a href={serviceURL} rel="noreferrer" target="_blank">
                    {t("service-policy")}
                </a>
            </div>
            {openCount > 0 && (
                <div className="join-page-mobile-wechat-overlay">
                    <img alt="[open-in-browser]" src={openInBrowserSVG} />
                    <strong>{t("open-in-browser")}</strong>
                </div>
            )}
        </div>
    );
};
