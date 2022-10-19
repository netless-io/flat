import logoSVG from "../icons/logo.svg";
import updateSVG from "../icons/update.svg";
import "./style.less";

import React, { useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { Button, message } from "antd";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../../components/AppUpgradeModal";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { ipcSyncByApp } from "../../../utils/ipc";
import { runtime } from "../../../utils/runtime";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";

export const AboutPage = (): React.ReactElement => {
    const t = useTranslate();
    const sp = useSafePromise();
    const [updateInfo, setUpdateInfo] = useState<AppUpgradeModalProps["updateInfo"]>(null);
    const [loading, setLoading] = useState(false);

    const checkUpgradeVersion = (): void => {
        setLoading(true);
        void sp(ipcSyncByApp("get-update-info")).then(data => {
            setLoading(false);
            if (!data.hasNewVersion || data.version === runtime.appVersion) {
                void message.info(t("latest-version-tips"));
            } else {
                setUpdateInfo(data);
            }
        });
    };

    return (
        <UserSettingLayoutContainer>
            <div className="about-page-container">
                <img alt="app logo" src={logoSVG} />
                <div className="flat-name">{t("app-name")}</div>
                <div className="flat-version">Version {runtime.appVersion}</div>
                <Button loading={loading} type="primary" onClick={checkUpgradeVersion}>
                    <img src={updateSVG} />
                    {t("check-updates")}
                </Button>
            </div>
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </UserSettingLayoutContainer>
    );
};
