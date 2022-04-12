import "./index.less";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { constants } from "flat-types";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { LoginPanel, LoginButtonProviderType, LoginWithPhone } from "flat-components";
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
import {
    loginPhone,
    loginPhoneSendCode,
    LoginProcessResult,
} from "../../api-middleware/flatServer";

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

    const onLoginResult = useCallback(
        (authData: LoginProcessResult) => {
            globalStore.updateUserInfo(authData);
            pushHistory(RouteNameType.HomePage);
        },
        [globalStore, pushHistory],
    );

    const handleLogin = useCallback(
        (loginChannel: LoginButtonProviderType) => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }

            switch (loginChannel) {
                case "github": {
                    loginDisposer.current = githubLogin(onLoginResult);
                    return;
                }
                case "google": {
                    loginDisposer.current = googleLogin(onLoginResult);
                    return;
                }
                default: {
                    return;
                }
            }
        },
        [onLoginResult],
    );

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL_EN;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL_EN;

    // @TODO: Login with email.
    return (
        <div className="login-page-container">
            <LoginPanel>
                <LoginWithPhone
                    buttons={[process.env.FLAT_REGION === "US" ? "google" : "wechat", "github"]}
                    loginOrRegister={async (countryCode, phone, code) => {
                        try {
                            await loginPhone(countryCode + phone, Number(code)).then(onLoginResult);
                            return true;
                        } catch {
                            return false;
                        }
                    }}
                    privacyURL={privacyURL}
                    renderQRCode={() => <WeChatLogin />}
                    sendVerificationCode={async (countryCode, phone) => {
                        try {
                            await loginPhoneSendCode(countryCode + phone);
                            return true;
                        } catch {
                            return false;
                        }
                    }}
                    serviceURL={serviceURL}
                    onClickButton={handleLogin}
                />
            </LoginPanel>
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </div>
    );
});

export default LoginPage;
