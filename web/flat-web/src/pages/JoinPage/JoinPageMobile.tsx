import logoSVG from "./icons/logo-sm.svg";

import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";

export interface JoinPageMobileProps {
    roomUUID: string;
    privacyURL: string;
    serviceURL: string;
}

export default function JoinPageMobile({
    roomUUID,
    privacyURL,
    serviceURL,
}: JoinPageMobileProps): React.ReactElement {
    const { t } = useTranslation();

    const url = useMemo(() => `x-agora-flat-client://joinRoom?roomUUID=${roomUUID}`, [roomUUID]);

    const openApp = useCallback(() => {
        window.location.href = url;
    }, [url]);

    const download = (): void => {
        window.location.href = FLAT_DOWNLOAD_URL;
    };

    useEffect(() => {
        openApp();
    }, [openApp]);

    return (
        <div className="join-page-mobile-container">
            <iframe width="0" height="0" style={{ display: "none" }} src={url} />
            <div className="join-page-mobile-effect"></div>
            <div className="join-page-mobile-header">
                <div className="join-page-mobile-app-icon">
                    <img src={logoSVG} alt="flat-logo" />
                </div>
            </div>
            <div className="join-page-mobile-big-btns">
                <button className="join-page-mobile-big-btn" onClick={openApp}>
                    {t("open")} Flat
                </button>
                <button className="join-page-mobile-big-btn secondary" onClick={download}>
                    {t("download")} Flat
                </button>
            </div>
            <div className="join-page-mobile-footer">
                <a href={privacyURL} target="_blank" rel="noreferrer">
                    {t("privacy-agreement")}
                </a>
                <span>｜</span>
                <a href={serviceURL} target="_blank" rel="noreferrer">
                    {t("service-policy")}
                </a>
            </div>
        </div>
    );
}
