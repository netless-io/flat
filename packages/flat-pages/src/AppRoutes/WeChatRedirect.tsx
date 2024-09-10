import "../JoinPage/style.less";

import logoSVG from "../JoinPage/icons/logo-sm.svg";
import openInBrowserSVG from "../JoinPage/icons/open-in-browser.svg";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguage, useTranslate } from "@netless/flat-i18n";
import {
    FLAT_DOWNLOAD_URL,
    FLAT_REGION,
    PRIVACY_URL_CN_CN,
    PRIVACY_URL_CN_EN,
    PRIVACY_URL_EN_CN,
    PRIVACY_URL_EN_EN,
    SERVICE_URL_CN_CN,
    SERVICE_URL_CN_EN,
    SERVICE_URL_EN_CN,
    SERVICE_URL_EN_EN,
} from "../constants/process";
import { isWeChatBrowser } from "../utils/user-agent";

export interface WeChatRedirectProps {
    url?: string;
    open?: boolean;
}

// This is a simplified version of JoinPageMobile.tsx, it can not join room.
export const WeChatRedirect = ({ url, open }: WeChatRedirectProps): React.ReactElement => {
    const t = useTranslate();
    const language = useLanguage();
    const [openCount, setOpenCount] = useState(0);

    const privacyURL =
        FLAT_REGION === "CN"
            ? language.startsWith("zh")
                ? PRIVACY_URL_CN_CN
                : PRIVACY_URL_CN_EN
            : language.startsWith("zh")
              ? PRIVACY_URL_EN_CN
              : PRIVACY_URL_EN_EN;
    const serviceURL =
        FLAT_REGION === "CN"
            ? language.startsWith("zh")
                ? SERVICE_URL_CN_CN
                : SERVICE_URL_CN_EN
            : language.startsWith("zh")
              ? SERVICE_URL_EN_CN
              : SERVICE_URL_EN_EN;

    const openApp = useCallback((): void => {
        window.location.href = url || "x-agora-flat-client://active";
        setOpenCount(count => count + 1);
    }, [url]);

    const download = (): void => {
        window.location.href = FLAT_DOWNLOAD_URL;
    };

    useEffect(() => {
        if (open) {
            openApp();
        }
    }, [open, openApp]);

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
            {openCount > 0 && isWeChatBrowser && (
                <div className="join-page-mobile-wechat-overlay">
                    <img alt="[open-in-browser]" src={openInBrowserSVG} />
                    <strong>{t("open-in-browser")}</strong>
                </div>
            )}
        </div>
    );
};
