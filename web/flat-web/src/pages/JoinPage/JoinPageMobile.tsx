import logoSVG from "./icons/logo-sm.svg";

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isAndroid } from "react-device-detect";

export interface JoinPageMobileProps {
    privacyURL: string;
    serviceURL: string;
    joinRoom: () => void;
}

// TODO: change this url to some stable one
const AndroidApkUrl =
    "https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions/latest/stable/android/Flat-v1.0.2.apk";

export default function JoinPageMobile({
    privacyURL,
    serviceURL,
    joinRoom,
}: JoinPageMobileProps): React.ReactElement {
    const { t } = useTranslation();

    const download = useCallback(() => {
        if (isAndroid) {
            window.open(AndroidApkUrl);
        } else {
            window.open("https://flat.whiteboard.agora.io/#download", "_blank");
        }
    }, []);

    return (
        <div className="join-page-mobile-container">
            <div className="join-page-mobile-effect"></div>
            <div className="join-page-mobile-header">
                <div className="join-page-mobile-app-icon">
                    <img src={logoSVG} alt="flat-logo" />
                </div>
            </div>
            <div className="join-page-mobile-big-btns">
                <button className="join-page-mobile-big-btn" onClick={joinRoom}>
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
