import logoSVG from "./icons/logo-sm.svg";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAndroid } from "react-device-detect";
import { useWindowFocus } from "./use-window-focus";
import { useIsUnMounted } from "../../utils/hooks/lifecycle";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";

export interface JoinPageMobileProps {
    roomUUID: string;
    privacyURL: string;
    serviceURL: string;
}

// TODO: change this url to some stable one
const AndroidApkUrl =
    "https://flat-storage.oss-cn-hangzhou.aliyuncs.com/versions/latest/stable/android/Flat-v1.0.2.apk";

export default function JoinPageMobile({
    roomUUID,
    privacyURL,
    serviceURL,
}: JoinPageMobileProps): React.ReactElement {
    const { t } = useTranslation();
    const [isCheckingApp, setCheckApp] = useState(false);
    const isFocus = useWindowFocus();
    const isUnmounted = useIsUnMounted();
    const isDownloaded = useRef(false);

    const openApp = useCallback(() => {
        window.location.href = `x-agora-flat-client://joinRoom?roomUUID=${roomUUID}`;
        setTimeout(() => {
            if (!isUnmounted.current) {
                setCheckApp(true);
            }
        }, 3000);
    }, [roomUUID, isUnmounted]);

    const download = useCallback(() => {
        isDownloaded.current = true;
        if (isAndroid) {
            window.open(AndroidApkUrl);
        } else {
            window.open(FLAT_DOWNLOAD_URL, "_blank");
        }
    }, []);

    useEffect(() => {
        if (isCheckingApp && !isDownloaded.current) {
            // if 5 seconds later the page is still in focus,
            // then maybe the app is not opened.
            if (isFocus) {
                download();
            }
        }
    }, [isCheckingApp, isFocus, download]);

    return (
        <div className="join-page-mobile-container">
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
