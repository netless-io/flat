import "./style.less";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";
import { wrap } from "./utils/disposer";
import { useLoginState } from "./utils/state";
import { WeChatLogin } from "./WeChatLogin";
import {
    PRIVACY_URL_CN_CN,
    PRIVACY_URL_CN_EN,
    PRIVACY_URL_EN_CN,
    PRIVACY_URL_EN_EN,
    SERVICE_URL_CN_CN,
    SERVICE_URL_CN_EN,
    SERVICE_URL_EN_CN,
    SERVICE_URL_EN_EN,
} from "../constants/process";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { AppUpgradeModal } from "../components/AppUpgradeModal";

import {
    LoginPanel,
    LoginWithCode,
    LoginWithPassword,
    BindingPhonePanel,
    QRCodePanel,
    RegisterModal,
    LoginKeyType,
    PasswordLoginType,
    LoginButtonProviderType,
    RebindingPhonePanel,
} from "flat-components";
import {
    bindingPhone,
    bindingPhoneSendCode,
    loginEmailWithPwd,
    loginPhoneWithPwd,
    loginPhone,
    loginPhoneSendCode,
    resetPhoneSendCode,
    resetEmailSendCode,
    resetPwdWithEmail,
    resetPwdWithPhone,
    registerEmail,
    registerPhone,
    registerEmailSendCode,
    registerPhoneSendCode,
    rebindingPhoneSendCode,
    rebindingPhone,
    FLAT_REGION,
} from "@netless/flat-server-api";
import { globalStore } from "@netless/flat-stores";

export const LoginPage = observer(function LoginPage() {
    const language = useLanguage();
    const sp = useSafePromise();
    const [phone, setBindingPhone] = useState("");

    const { currentState, setCurrentState, handleLogin, onLoginResult, onBoundPhone } =
        useLoginState();

    const panel = useMemo(() => {
        // const privacyURL = language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
        // const serviceURL = language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

        const privacyURL =
            FLAT_REGION === "CN"
                ? language.startsWith("zh")
                    ? PRIVACY_URL_CN_CN
                    : PRIVACY_URL_CN_EN
                : language.startsWith("zh")
                  ? PRIVACY_URL_EN_CN
                  : PRIVACY_URL_EN_EN;
        const serviceURL =
            FLAT_REGION === "CN"
                ? language.startsWith("zh")
                    ? SERVICE_URL_CN_CN
                    : SERVICE_URL_CN_EN
                : language.startsWith("zh")
                  ? SERVICE_URL_EN_CN
                  : SERVICE_URL_EN_EN;
        const emailLanguage = language.startsWith("zh") ? "zh" : "en";

        const loginProps = {
            buttons: process.env.LOGIN_METHODS.split(",") as LoginButtonProviderType[],
            privacyURL,
            serviceURL,
            onClickButton: handleLogin,
        };

        switch (currentState.value) {
            case "loginWithCode": {
                return (
                    <LoginWithCode
                        {...loginProps}
                        loginOrRegister={async (countryCode, phone, code) =>
                            wrap(loginPhone(countryCode + phone, Number(code)).then(onLoginResult))
                        }
                        loginWithPassword={() => setCurrentState("SWITCH_TO_PASSWORD")}
                        sendVerificationCode={async (countryCode, phone) =>
                            wrap(loginPhoneSendCode(countryCode + phone))
                        }
                    />
                );
            }
            case "register": {
                return (
                    <RegisterModal
                        backToLogin={() => setCurrentState("SWITCH_TO_PASSWORD")}
                        {...loginProps}
                        register={(
                            type: PasswordLoginType,
                            { key, originKey, countryCode }: LoginKeyType,
                            code,
                            password: string,
                        ) =>
                            wrap(
                                type === PasswordLoginType.Email
                                    ? registerEmail(key, Number(code), password).then(() => {
                                          sp(loginEmailWithPwd(key, password)).then(authInfo =>
                                              onLoginResult(authInfo, { key: originKey, password }),
                                          );
                                      })
                                    : registerPhone(key, Number(code), password).then(() => {
                                          sp(loginPhoneWithPwd(key, password)).then(authInfo =>
                                              onLoginResult(authInfo, {
                                                  key: originKey,
                                                  password,
                                                  countryCode,
                                              }),
                                          );
                                      }),
                            )
                        }
                        sendVerificationCode={async (type, key) =>
                            wrap(
                                type === PasswordLoginType.Email
                                    ? registerEmailSendCode(key, emailLanguage)
                                    : registerPhoneSendCode(key),
                            )
                        }
                    />
                );
            }
            case "wechatQRCode": {
                return (
                    <QRCodePanel
                        backToLogin={() => setCurrentState("SWITCH_TO_PASSWORD")}
                        renderQRCode={() => <WeChatLogin onLoginResult={onLoginResult} />}
                    />
                );
            }
            case "bindingPhone": {
                return (
                    <BindingPhonePanel
                        bindingPhone={async (countryCode, phone, code) =>
                            wrap(bindingPhone(countryCode + phone, Number(code)).then(onBoundPhone))
                        }
                        cancelBindingPhone={() => {
                            onLoginResult(null);
                            setCurrentState("SWITCH_TO_PASSWORD");
                        }}
                        needRebindingPhone={phone => {
                            setBindingPhone(phone);
                            setCurrentState("SWITCH_TO_REBINDING_PHONE");
                        }}
                        sendBindingPhoneCode={async (countryCode, phone) =>
                            bindingPhoneSendCode(countryCode + phone)
                        }
                    />
                );
            }
            case "rebindingPhone": {
                return (
                    <RebindingPhonePanel
                        cancelRebindingPhone={() => {
                            setCurrentState("SWITCH_TO_BINDING_PHONE");
                        }}
                        defaultPhone={phone}
                        rebindingPhone={async (countryCode, phone, code) =>
                            wrap(
                                rebindingPhone(countryCode + phone, Number(code)).then(
                                    onLoginResult,
                                ),
                            )
                        }
                        sendRebindingPhoneCode={async (countryCode, phone) =>
                            rebindingPhoneSendCode(countryCode + phone)
                        }
                    />
                );
            }
            default: {
                return (
                    <LoginWithPassword
                        {...loginProps}
                        accountHistory={globalStore.accountHistory}
                        login={async (
                            type,
                            { key, originKey, countryCode }: LoginKeyType,
                            password,
                        ) =>
                            wrap(
                                type === PasswordLoginType.Email
                                    ? loginEmailWithPwd(key, password).then(authInfo =>
                                          onLoginResult(authInfo, { key: originKey, password }),
                                      )
                                    : loginPhoneWithPwd(key, password).then(authInfo =>
                                          onLoginResult(authInfo, {
                                              key: originKey,
                                              password,
                                              countryCode,
                                          }),
                                      ),
                            )
                        }
                        loginWithVerificationCode={() => setCurrentState("SWITCH_TO_CODE")}
                        register={() => setCurrentState("SWITCH_TO_REGISTER")}
                        resetPassword={(
                            type: PasswordLoginType,
                            { key, originKey, countryCode }: LoginKeyType,
                            code: string,
                            password: string,
                        ) =>
                            wrap(
                                type === PasswordLoginType.Email
                                    ? resetPwdWithEmail(key, Number(code), password).then(() => {
                                          sp(loginEmailWithPwd(key, password)).then(authInfo =>
                                              onLoginResult(authInfo, { key: originKey, password }),
                                          );
                                      })
                                    : resetPwdWithPhone(key, Number(code), password).then(() => {
                                          sp(loginPhoneWithPwd(key, password)).then(authInfo =>
                                              onLoginResult(authInfo, {
                                                  key: originKey,
                                                  password,
                                                  countryCode,
                                              }),
                                          );
                                      }),
                            )
                        }
                        sendVerificationCode={async (type, key) =>
                            wrap(
                                type === PasswordLoginType.Email
                                    ? resetEmailSendCode(key, emailLanguage)
                                    : resetPhoneSendCode(key),
                            )
                        }
                    />
                );
            }
        }
    }, [
        language,
        handleLogin,
        currentState.value,
        onLoginResult,
        setCurrentState,
        sp,
        onBoundPhone,
        phone,
    ]);

    return (
        <div className="login-page-container" style={{ borderRadius: window.isElectron ? 0 : 12 }}>
            <LoginPanel>{panel}</LoginPanel>
            <AppUpgradeModal />
        </div>
    );
});

export default LoginPage;
