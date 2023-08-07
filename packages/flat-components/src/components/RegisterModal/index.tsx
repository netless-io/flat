import "./index.less";

import { useTranslate } from "@netless/flat-i18n";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LoginTitle } from "../LoginPage/LoginTitle";
import emailSVG from "../LoginPage/icons/email.svg";
import lockSVG from "../LoginPage/icons/lock.svg";
import checkedSVG from "../LoginPage/icons/checked.svg";
import { Input, Select, Button, message } from "antd";
import {
    validateCode,
    PasswordLoginType,
    validatePassword,
    validatePhone,
    validateEmail,
    validateIsPhone,
    requestAgreement,
    LoginButtonProviderType,
    LoginButtonsDescription,
    LoginButtons,
    LoginButtonsProps,
    LoginKeyType,
} from "../LoginPage";
import { COUNTRY_CODES } from "../LoginPage/LoginWithCode/data";
import { useIsUnMounted, useSafePromise } from "../../utils/hooks";
import { LoginPanelContent } from "../LoginPage/LoginPanelContent";
import { LoginAgreement, LoginAgreementProps } from "../LoginPage/LoginAgreement";

export interface RegisterProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    onClickButton: LoginButtonsProps["onClick"];
    sendVerificationCode: (type: PasswordLoginType, key: string) => Promise<boolean>;
    register: (
        type: PasswordLoginType,
        key: LoginKeyType,
        code: string,
        password: string,
    ) => Promise<boolean>;
    backToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterProps> = ({
    buttons: userButtons,
    sendVerificationCode,
    register,
    backToLogin,
    privacyURL,
    serviceURL,
    onClickButton,
}) => {
    const t = useTranslate();
    const sp = useSafePromise();

    const buttons = useMemo<LoginButtonsDescription>(
        () =>
            userButtons
                ? userButtons.map(e => ({ provider: e, text: t(`login-${e}`) }))
                : [
                      { provider: "google", text: t("login-google") },
                      { provider: "github", text: t("login-github") },
                  ],
        [t, userButtons],
    );

    const isUnMountRef = useIsUnMounted();

    const [key, setKey] = useState<PasswordLoginType>(PasswordLoginType.Phone);

    const [keyValue, setKeyValue] = useState("");
    const [password, setPassword] = useState("");
    const [countryCode, setCountryCode] = useState("+86");
    const [code, setCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);
    const [clickedRegister, setClickedRegister] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const isPhone = key === PasswordLoginType.Phone;
    const inputType = isPhone ? "text" : "email";
    const inputSize = isPhone ? "small" : "middle";
    const [isKeyInputValidate, setIsKeyInputValidate] = useState(false);

    const canRegister =
        keyValue && isKeyInputValidate && validatePassword(password) && validateCode(code);

    const doRegister = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        setClickedRegister(true);
        if (
            await sp(
                register(
                    key,
                    {
                        key: isPhone ? countryCode + keyValue : keyValue,
                        originKey: keyValue,
                    },
                    code,
                    password,
                ),
            )
        ) {
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            message.info(t("register-failed"));
        }

        setClickedRegister(false);
    }, [
        key,
        isPhone,
        agreed,
        serviceURL,
        privacyURL,
        countryCode,
        keyValue,
        code,
        password,
        register,
        sp,
        t,
    ]);

    const onClick = useCallback(
        async (provider: LoginButtonProviderType) => {
            if (!agreed) {
                if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                    return;
                }
                setAgreed(true);
            }
            onClickButton(provider);
        },
        [agreed, onClickButton, privacyURL, serviceURL, t],
    );

    useEffect(() => {
        if (!keyValue || validateIsPhone(keyValue)) {
            setKey(PasswordLoginType.Phone);
        } else {
            setKey(PasswordLoginType.Email);
        }

        if (isPhone) {
            setIsKeyInputValidate(validatePhone(keyValue));
        } else {
            setIsKeyInputValidate(validateEmail(keyValue));
        }
    }, [keyValue, isPhone]);

    const sendCode = useCallback(async () => {
        if (isKeyInputValidate) {
            setSendingCode(true);
            const sent = await sp(
                sendVerificationCode(key, isPhone ? countryCode + keyValue : keyValue),
            );
            setSendingCode(false);
            if (sent) {
                void message.info(
                    t(isPhone ? "sent-verify-code-to-phone" : "sent-verify-code-to-email"),
                );
                let count = 60;
                setCountdown(count);
                const timer = setInterval(() => {
                    if (isUnMountRef.current) {
                        clearInterval(timer);
                        return;
                    }
                    setCountdown(--count);
                    if (count === 0) {
                        clearInterval(timer);
                    }
                }, 1000);
            }
        }
    }, [
        countryCode,
        isUnMountRef,
        sendVerificationCode,
        sp,
        t,
        isPhone,
        key,
        keyValue,
        isKeyInputValidate,
    ]);

    const [page] = useState("register");

    return (
        <LoginPanelContent transitionKey={page}>
            <div className="register-content">
                <div className="register-width-limiter">
                    <LoginTitle subtitle=" " title={t("register-title")} />

                    <Input
                        placeholder={t("enter-email-or-phone")}
                        prefix={
                            isPhone ? (
                                <Select
                                    bordered={false}
                                    defaultValue="+86"
                                    onChange={setCountryCode}
                                >
                                    {COUNTRY_CODES.map(code => (
                                        <Select.Option
                                            key={code}
                                            value={`+${code}`}
                                        >{`+${code}`}</Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                <img alt="email" src={emailSVG} />
                            )
                        }
                        size={inputSize}
                        status={isKeyInputValidate || !keyValue ? void 0 : "error"}
                        type={inputType}
                        value={keyValue}
                        onChange={ev => setKeyValue(ev.currentTarget.value)}
                    />

                    <Input
                        placeholder={t("enter-code")}
                        prefix={<img alt="checked" draggable={false} src={checkedSVG} />}
                        status={!code || validateCode(code) ? undefined : "error"}
                        suffix={
                            countdown > 0 ? (
                                <span className="login-countdown">
                                    {t("seconds-to-resend", { seconds: countdown })}
                                </span>
                            ) : (
                                <Button
                                    disabled={sendingCode || !isKeyInputValidate || !keyValue}
                                    loading={sendingCode}
                                    size="small"
                                    type="link"
                                    onClick={sendCode}
                                >
                                    {t("send-verify-code")}
                                </Button>
                            )
                        }
                        value={code}
                        onChange={ev => setCode(ev.currentTarget.value)}
                    />

                    <Input.Password
                        placeholder={t("enter-password")}
                        prefix={<img alt="password" src={lockSVG} />}
                        status={!password || validatePassword(password) ? void 0 : "error"}
                        value={password}
                        onChange={ev => setPassword(ev.currentTarget.value)}
                    />

                    <LoginAgreement
                        checked={agreed}
                        privacyURL={privacyURL}
                        serviceURL={serviceURL}
                        onChange={setAgreed}
                    />

                    <Button
                        className="login-big-button login-with-resetting-btn"
                        disabled={!canRegister}
                        loading={clickedRegister}
                        type="primary"
                        onClick={doRegister}
                    >
                        {t("register-and-login")}
                    </Button>
                    <Button className="login-big-button" type="link" onClick={backToLogin}>
                        {t("back")}
                    </Button>
                </div>

                <div className="login-splitter">
                    <span className="login-splitter-text">{t("also-login-with")}</span>
                </div>
                <LoginButtons buttons={buttons} onClick={onClick} />
            </div>
        </LoginPanelContent>
    );
};
