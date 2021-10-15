import "./index.less";

import React, { useContext, useEffect, useRef, useState } from "react";
import { constants } from "flat-types";
import { observer } from "mobx-react-lite";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { LoginChannelType, LoginPanel } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../components/AppUpgradeModal";
import { runtime } from "../../utils/runtime";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { WeChatLogin } from "./WeChatLogin";
import { useTranslation } from "react-i18next";
import { PRIVACY_URL, PRIVACY_URL_CN, SERVICE_URL, SERVICE_URL_CN } from "../../constants/process";

export const LoginPage = observer(function LoginPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();
    const [updateInfo, setUpdateInfo] = useState<AppUpgradeModalProps["updateInfo"]>(null);
    const sp = useSafePromise();

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: true,
        });

        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
        };
    }, []);

    useEffect(() => {
        sp(ipcSyncByApp("get-update-info"))
            .then(data => {
                console.log("[Auto Updater]: Get Update Info");
                if (data.hasNewVersion) {
                    console.log(
                        `[Auto Updater]: Remote Version "${data.version}", Local Version "${runtime.appVersion}"`,
                    );
                    if (data.version !== runtime.appVersion) {
                        setUpdateInfo(data);
                    }
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    }, [sp]);

    const handleLogin = (loginChannel: LoginChannelType): React.ReactElement | undefined => {
        if (loginDisposer.current) {
            loginDisposer.current();
            loginDisposer.current = void 0;
        }

        switch (loginChannel) {
            case "github": {
                loginDisposer.current = githubLogin(authData => {
                    globalStore.updateUserInfo(authData);
                    pushHistory(RouteNameType.HomePage);
                });
                return;
            }
            case "wechat": {
                return <WeChatLogin />;
            }
            default: {
                return;
            }
        }
    };

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    return (
        <div className="login-page-container">
            <LoginPanel onLogin={handleLogin} privacyURL={privacyURL} serviceURL={serviceURL} />
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </div>
    );
});

export default LoginPage;
