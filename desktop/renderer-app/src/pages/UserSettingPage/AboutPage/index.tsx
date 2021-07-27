import logoSVG from "../icons/logo.svg";
import updateSVG from "../icons/update.svg";
import "./style.less";

import React, { useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { Button, message } from "antd";
import { runtime } from "../../../utils/runtime";
import { ipcSyncByApp } from "../../../utils/ipc";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../../components/AppUpgradeModal";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { useTranslation } from "react-i18next";

export const AboutPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const sp = useSafePromise();
    const [updateInfo, setUpdateInfo] = useState<AppUpgradeModalProps["updateInfo"]>(null);

    const checkUpgradeVersion = (): void => {
        void sp(ipcSyncByApp("get-update-info")).then(data => {
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
                <div className="about-page-middle-container">
                    <img src={logoSVG} alt="flat logo" />
                    <div className="flat-name">Flat</div>
                    <div className="flat-version">Version {runtime.appVersion}</div>
                    <Button type="primary" onClick={checkUpgradeVersion}>
                        <img src={updateSVG} />
                        {t("check-updates")}
                    </Button>
                </div>
            </div>
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </UserSettingLayoutContainer>
    );
};
