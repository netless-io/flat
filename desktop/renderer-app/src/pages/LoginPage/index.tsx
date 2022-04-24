import "./index.less";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { constants } from "flat-types";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import {
    LoginPanel,
    LoginButtonProviderType,
    LoginWithPhone,
    TopBar,
    WindowsSystemBtnItem,
} from "flat-components";
import { githubLogin } from "./githubLogin";
import WeChatLogin from "./WeChatLogin";
import { googleLogin } from "./googleLogin";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { LoginDisposer } from "./utils";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { AppUpgradeModal, AppUpgradeModalProps } from "../../components/AppUpgradeModal";
import { errorTips } from "../../components/Tips/ErrorTips";
import { runtime } from "../../utils/runtime";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { NEED_BINDING_PHONE } from "../../constants/config";
import {
    PRIVACY_URL_EN,
    PRIVACY_URL_CN,
    SERVICE_URL_EN,
    SERVICE_URL_CN,
} from "../../constants/process";
import {
    bindingPhone,
    bindingPhoneSendCode,
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
    const [loginResult, setLoginResult_] = useState<LoginProcessResult | null>(null);

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

    const setLoginResult = useCallback(
        (userInfo: LoginProcessResult | null) => {
            globalStore.updateUserInfo(userInfo);
            setLoginResult_(userInfo);
            if (userInfo && (NEED_BINDING_PHONE ? userInfo.hasPhone : true)) {
                pushHistory(RouteNameType.HomePage);
            }
        },
        [globalStore, pushHistory],
    );

    const onLoginResult = useCallback(
        (authData: LoginProcessResult) => {
            globalStore.updateUserInfo(authData);
            if (NEED_BINDING_PHONE && !authData.hasPhone) {
                setLoginResult(authData);
            } else {
                pushHistory(RouteNameType.HomePage);
            }
        },
        [globalStore, pushHistory, setLoginResult],
    );

    const onBoundPhone = useCallback(() => {
        if (loginResult) {
            onLoginResult({ ...loginResult, hasPhone: true });
        }
    }, [loginResult, onLoginResult]);

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

    const onClickWindowsSystemBtn = (winSystemBtn: WindowsSystemBtnItem): void => {
        ipcAsyncByMainWindow("set-win-status", { windowStatus: winSystemBtn });
    };

    // @TODO: Login with email.
    return (
        <div className="login-page-container">
            <div className="login-page-top-bar">
                {!runtime.isMac && (
                    <TopBar
                        hiddenMaximizeBtn={true}
                        isMac={runtime.isMac}
                        onClickWindowsSystemBtn={onClickWindowsSystemBtn}
                    />
                )}
            </div>
            <LoginPanel>
                <LoginWithPhone
                    bindingPhone={async (countryCode, phone, code) =>
                        wrap(bindingPhone(countryCode + phone, Number(code)).then(onBoundPhone))
                    }
                    buttons={[process.env.FLAT_REGION === "US" ? "google" : "wechat", "github"]}
                    cancelBindingPhone={() => setLoginResult(null)}
                    isBindingPhone={
                        NEED_BINDING_PHONE && (loginResult ? !loginResult.hasPhone : false)
                    }
                    loginOrRegister={async (countryCode, phone, code) =>
                        wrap(loginPhone(countryCode + phone, Number(code)).then(onLoginResult))
                    }
                    privacyURL={privacyURL}
                    renderQRCode={() => <WeChatLogin setLoginResult={setLoginResult} />}
                    sendBindingPhoneCode={async (countryCode, phone) =>
                        wrap(bindingPhoneSendCode(countryCode + phone))
                    }
                    sendVerificationCode={async (countryCode, phone) =>
                        wrap(loginPhoneSendCode(countryCode + phone))
                    }
                    serviceURL={serviceURL}
                    onClickButton={handleLogin}
                />
            </LoginPanel>
            <AppUpgradeModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
        </div>
    );
});

function wrap(promise: Promise<unknown>): Promise<boolean> {
    return promise
        .then(() => true)
        .catch(err => {
            errorTips(err);
            return false;
        });
}

export default LoginPage;
