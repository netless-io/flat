import "./index.less";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { constants } from "flat-types";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { LoginPanel, LoginButton, LoginButtonProviderType } from "flat-components";
import { githubLogin } from "./githubLogin";
import WeChatLogin from "./WeChatLogin";
import { googleLogin } from "./googleLogin";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { LoginDisposer } from "./utils";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../components/AppUpgradeModal";
import { runtime } from "../../utils/runtime";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import {
    PRIVACY_URL_EN,
    PRIVACY_URL_CN,
    SERVICE_URL_EN,
    SERVICE_URL_CN,
} from "../../constants/process";

export const LoginPage = observer(function LoginPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();
    const [updateInfo, setUpdateInfo] = useState<AppUpgradeModalProps["updateInfo"]>(null);
    const [isWeChatLogin, setWeChatLogin] = useState<boolean>(false);
    const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

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

    const handleLogin = useCallback(
        (loginChannel: LoginButtonProviderType) => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }

            const doLogin = (loginChannel: LoginButtonProviderType): void => {
                switch (loginChannel) {
                    case "github": {
                        loginDisposer.current = githubLogin(authData => {
                            globalStore.updateUserInfo(authData);
                            pushHistory(RouteNameType.HomePage);
                        });
                        return;
                    }
                    case "google": {
                        loginDisposer.current = googleLogin(async authData => {
                            globalStore.updateUserInfo(authData);
                            pushHistory(RouteNameType.HomePage);
                        });
                        return;
                    }
                    case "wechat": {
                        setWeChatLogin(true);
                        return;
                    }
                    default: {
                        return;
                    }
                }
            };
            if (agreementChecked) {
                doLogin(loginChannel);
            } else {
                void message.info(i18n.t("agree-terms"));
            }
        },
        [agreementChecked, globalStore, i18n, pushHistory],
    );

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL_EN;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL_EN;

    function renderButtonList(): React.ReactNode {
        return (
            <>
                {process.env.FLAT_REGION === "America" ? (
                    <LoginButton
                        provider="google"
                        text={i18n.t("login-google")}
                        onLogin={handleLogin}
                    />
                ) : (
                    <LoginButton
                        provider="wechat"
                        text={i18n.t("login-wechat")}
                        onLogin={handleLogin}
                    />
                )}
                <LoginButton
                    provider="github"
                    text={i18n.t("login-github")}
                    onLogin={handleLogin}
                />
            </>
        );
    }

    function renderQRCode(): React.ReactNode {
        return <WeChatLogin />;
    }

    return (
        <div className="login-page-container">
            <LoginPanel
                agreementChecked={agreementChecked}
                handleClickAgreement={() => setAgreementChecked(!agreementChecked)}
                handleHideQRCode={() => setWeChatLogin(false)}
                privacyURL={privacyURL}
                renderButtonList={renderButtonList}
                renderQRCode={renderQRCode}
                serviceURL={serviceURL}
                showQRCode={isWeChatLogin}
            />
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </div>
    );
});

export default LoginPage;
