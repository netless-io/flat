import logoSVG from "../icons/logo.svg";
import updateSVG from "../icons/update.svg";
import "./index.less";

import React, { useContext, useEffect, useState } from "react";
import { UserSettingLayoutContainer } from "../UserSettingLayoutContainer";
import { Button, message } from "antd";
import { GlobalStoreContext } from "../../../components/StoreProvider";
import { runtime } from "../../../utils/runtime";
import { ipcSyncByApp } from "../../../utils/ipc";
import { AppUpgradeModal } from "../../../components/AppUpgradeModal";

export const AboutPage = (): React.ReactElement => {
    const [appVersionState, setAppVersionState] = useState<string>();

    const globalStore = useContext(GlobalStoreContext);

    useEffect(() => {
        ipcSyncByApp("get-update-info").then(data => {
            if (data.hasNewVersion) {
                setAppVersionState(data.version);
            }
        });
    }, [appVersionState]);

    const checkUpgradeVersion = (): void => {
        if (appVersionState === runtime.appVersion) {
            message.info("当前已是最新版本");
        } else {
            globalStore.showAppUpgradeModal();
        }
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
                        检查更新
                    </Button>
                </div>
                {/* <div className="about-page-bottom-container">
                    <a href="">服务协议</a>｜<a href="">隐私政策</a>｜<a href="">GitHub</a>
                </div> */}
            </div>
            <AppUpgradeModal />
        </UserSettingLayoutContainer>
    );
};
