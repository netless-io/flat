import "./style.less";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { LoginPanel, LoginButtonProviderType, LoginWithPhone } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { WeChatLogin } from "./WeChatLogin";
import { agoraLogin } from "./agoraLogin";
import { googleLogin } from "./googleLogin";
import { RouteNameType, usePushHistory, useURLParams } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { joinRoomHandler } from "../utils/join-room-handler";
import { PRIVACY_URL, PRIVACY_URL_CN, SERVICE_URL, SERVICE_URL_CN } from "../../constants/process";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import {
    agoraSSOLoginCheck,
    bindingPhone,
    bindingPhoneSendCode,
    loginCheck,
    loginPhone,
    loginPhoneSendCode,
    LoginProcessResult,
} from "../../api-middleware/flatServer";

export const LoginPage = observer(function LoginPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();

    const roomUUID = sessionStorage.getItem("roomUUID");

    const sp = useSafePromise();
    const urlParams = useURLParams();
    const [loginResult, setLoginResult] = useState<LoginProcessResult | null>(null);

    useEffect(() => {
        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            sessionStorage.clear();
        };
    }, []);

    useEffect(() => {
        const effect = async (): Promise<void> => {
            const { jwtToken } = await sp(agoraSSOLoginCheck(globalStore.agoraSSOLoginID!));
            const userInfo = await sp(loginCheck(jwtToken));
            globalStore.updateUserInfo(userInfo);
            if (userInfo.hasPhone) {
                pushHistory(RouteNameType.HomePage);
            }
        };

        if (urlParams.utm_source === "agora" && globalStore.agoraSSOLoginID) {
            effect().catch(error => {
                // no handling required
                console.warn(error);
            });
        }
    });

    const onLoginResult = useCallback(
        async (authData: LoginProcessResult) => {
            if (authData.agoraSSOLoginID) {
                globalStore.updateAgoraSSOLoginID(authData.agoraSSOLoginID);
            }
            globalStore.updateUserInfo(authData);
            if (!authData.hasPhone) {
                setLoginResult(authData);
                return;
            }
            if (!roomUUID) {
                pushHistory(RouteNameType.HomePage);
                return;
            }
            if (globalStore.isTurnOffDeviceTest) {
                await joinRoomHandler(roomUUID, pushHistory);
            } else {
                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
            }
        },
        [globalStore, pushHistory, roomUUID],
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
                case "agora": {
                    loginDisposer.current = agoraLogin(onLoginResult);
                    return;
                }
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

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    // @TODO: Login with email.
    return (
        <div className="login-page-container">
            <LoginPanel>
                <LoginWithPhone
                    bindingPhone={async (countryCode, phone, code) =>
                        wrap(bindingPhone(countryCode + phone, Number(code)).then(onBoundPhone))
                    }
                    buttons={
                        urlParams.utm_source === "agora"
                            ? ["agora"]
                            : [process.env.FLAT_REGION === "US" ? "google" : "wechat", "github"]
                    }
                    isBindingPhone={loginResult ? !loginResult.hasPhone : false}
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
