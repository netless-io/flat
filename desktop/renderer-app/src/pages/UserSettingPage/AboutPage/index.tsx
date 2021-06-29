import logoSVG from "../icons/logo.svg";
import updateSVG from "../icons/update.svg";
import "./style.less";

import React, { useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { Button, message } from "antd";
import { runtime } from "../../../utils/runtime";
import { ipcSyncByApp } from "../../../utils/ipc";
import { AppUpgradeModal } from "../../../components/AppUpgradeModal";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { useTranslation } from "react-i18next";

export const AboutPage = (): React.ReactElement => {
    const { t } = useTranslation();
    const sp = useSafePromise();
    const [newVersion, setNewVersion] = useState<string>();

    const checkUpgradeVersion = (): void => {
        void sp(ipcSyncByApp("get-update-info")).then(data => {
            if (!data.hasNewVersion || data.version === runtime.appVersion) {
                void message.info(t("latest-version-tips"));
            } else {
                setNewVersion(data.version);
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
                {/* <div className="about-page-bottom-container">
                    <a href="">服务协议</a>｜<a href="">隐私政策</a>｜<a href="">GitHub</a>
                </div> */}
            </div>
            <AppUpgradeModal newVersion={newVersion} onClose={() => setNewVersion(void 0)} />
        </UserSettingLayoutContainer>
    );
};
