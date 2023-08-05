import emailSVG from "../icons/email.svg";
import lockSVG from "../icons/lock.svg";
import checkedSVG from "../icons/checked.svg";
import "./index.less";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { Button, Input, Select, message } from "antd";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import {
    LoginButtonProviderType,
    LoginButtons,
    LoginButtonsDescription,
    LoginButtonsProps,
} from "../LoginButtons";
import { LoginPanelContent } from "../LoginPanelContent";
import { requestAgreement, validateCode, validatePhone } from "../LoginWithCode";
import { COUNTRY_CODES } from "../LoginWithCode/data";

export * from "../LoginButtons";

// to distinguish phone and email
const phoneRegex = /^\d+$/;
const emailRegex = /^[^.\s@:](?:[^\s@:]*[^\s@:.])?@[^.\s@]+(?:\.[^.\s@]+)*$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

export function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export function validateIsPhone(phone: string): boolean {
    return phoneRegex.test(phone);
}

export function validatePassword(password: string): boolean {
    return passwordRegex.test(password);
}

export enum PasswordLoginType {
    Phone = "phone",
    Email = "email",
}

export enum PasswordLoginPageType {
    Login = "login",
    Reset = "reset-password",
}

export type LoginKeyType = {
    key: string;
    originKey: string;
};

export interface LoginWithPasswordProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    accountHistory: Array<{ key: string; password: string }> | [];
    login: (type: PasswordLoginType, key: LoginKeyType, password: string) => Promise<boolean>;
    register: () => void;
    onClickButton: LoginButtonsProps["onClick"];
    loginWithVerificationCode: () => void;
    sendVerificationCode: (type: PasswordLoginType, key: string) => Promise<boolean>;
    resetPassword: (
        type: PasswordLoginType,
        key: LoginKeyType,
        code: string,
        password: string,
    ) => Promise<boolean>;
}

export const LoginWithPassword: React.FC<LoginWithPasswordProps> = ({
    buttons: userButtons,
    privacyURL,
    serviceURL,
    accountHistory,
    onClickButton,
    login,
    resetPassword,
    register,
    sendVerificationCode,
    loginWithVerificationCode,
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

    const [page, setPage] = useState<PasswordLoginPageType>(PasswordLoginPageType.Login);
    const [key, setKey] = useState<PasswordLoginType>(PasswordLoginType.Phone);

    const isUnMountRef = useIsUnMounted();

    // account and password
    const [keyValue, setKeyValue] = useState(accountHistory[0]?.key || "");
    const [password, setPassword] = useState(accountHistory[0]?.password || "");

    const [agreed, setAgreed] = useState(false);
    const [clickedLogin, setClickedLogin] = useState(false);
    const [clickedReset, setClickedReset] = useState(false);
    const [countryCode, setCountryCode] = useState("+86");

    const [code, setCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [sendingCode, setSendingCode] = useState(false);

    const isResettingPage = page === PasswordLoginPageType.Reset;
    const isPhone = key === PasswordLoginType.Phone;
    const inputType = isPhone ? "text" : "email";
    const inputSize = isPhone ? "small" : "middle";

    const [isKeyInputValidate, setIsKeyInputValidate] = useState(false);
    const canLogin = !clickedLogin && isKeyInputValidate && validatePassword(password);

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

    useEffect(() => {
        if (!keyValue) {
            setPassword("");
        }
    }, [keyValue]);

    useEffect(() => {
        if (isResettingPage) {
            setPassword("");
            setCode("");
        }
    }, [page, isResettingPage]);

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

    const doLogin = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        setClickedLogin(true);
        if (
            await sp(
                login(
                    key,
                    {
                        key: isPhone ? countryCode + keyValue : keyValue,
                        originKey: keyValue,
                    },
                    password,
                ),
            )
        ) {
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            message.info(t("login-failed"));
        }
        setClickedLogin(false);
    }, [
        agreed,
        keyValue,
        login,
        key,
        password,
        privacyURL,
        serviceURL,
        sp,
        t,
        isPhone,
        countryCode,
    ]);

    const doReset = useCallback(async () => {
        setClickedReset(true);
        if (
            await sp(
                resetPassword(
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
            message.info(t("reset-failed"));
        }

        setClickedReset(false);
    }, [key, isPhone, countryCode, keyValue, code, password, resetPassword, sp, t]);

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

    function renderLoginPage(): React.ReactNode {
        return (
            <div className="login-with-email">
                <div className="login-width-limiter">
                    <LoginTitle subtitle=" " />
                    <div>
                        <Input
                            allowClear
                            addonAfter={
                                accountHistory?.length ? (
                                    <Select
                                        labelInValue
                                        bordered={false}
                                        placement="bottomRight"
                                        value={{ key: password, value: keyValue }}
                                        onChange={options => {
                                            setKeyValue(options.value);
                                            setPassword(options.key);
                                        }}
                                    >
                                        {accountHistory.map(account => {
                                            return (
                                                <Select.Option
                                                    key={account.password}
                                                    value={account.key}
                                                >
                                                    {account.key}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                ) : null
                            }
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
                    </div>

                    <div>
                        <Input.Password
                            placeholder={t("enter-password")}
                            prefix={<img alt="password" src={lockSVG} />}
                            status={!password || validatePassword(password) ? void 0 : "error"}
                            value={password}
                            onChange={ev => setPassword(ev.currentTarget.value)}
                        />
                    </div>

                    <div className="login-with-email-btn-wrapper">
                        <Button type="link" onClick={loginWithVerificationCode}>
                            {t("verify-code-login")}
                        </Button>
                        <Button type="link" onClick={() => setPage(PasswordLoginPageType.Reset)}>
                            {t("forgot")}
                        </Button>
                    </div>

                    <LoginAgreement
                        checked={agreed}
                        privacyURL={privacyURL}
                        serviceURL={serviceURL}
                        onChange={setAgreed}
                    />
                    <Button
                        className="login-big-button login-with-email-login-btn"
                        disabled={!canLogin}
                        loading={clickedLogin}
                        type="primary"
                        onClick={doLogin}
                    >
                        {t("login")}
                    </Button>
                    <Button className="login-big-button" type="link" onClick={register}>
                        {t("register")}
                    </Button>
                </div>
                <div className="login-splitter">
                    <span className="login-splitter-text">{t("also-login-with")}</span>
                </div>
                <LoginButtons buttons={buttons} onClick={onClick} />
            </div>
        );
    }

    return (
        <LoginPanelContent transitionKey={page}>
            {isResettingPage
                ? resetPasswordPage({
                      t,
                      isPhone,
                      code,
                      setCode,
                      setPassword,
                      sendCode,
                      setCountryCode,
                      inputSize,
                      isKeyInputValidate,
                      inputType,
                      keyValue,
                      setKeyValue,
                      password,
                      sendingCode,
                      countdown,
                      setPage,
                      clickedReset,
                      doReset,
                  })
                : renderLoginPage()}
        </LoginPanelContent>
    );
};

export interface ResetPasswordPageProps {
    t: FlatI18nTFunction;
    keyValue: string;
    code: string;
    isPhone: boolean;
    inputSize: "small" | "middle";
    inputType: "text" | "email";
    sendingCode: boolean;
    countdown: number;
    isKeyInputValidate: boolean;
    password: string;
    setKeyValue: (keyValue: string) => void;
    setCountryCode: (code: string) => void;
    setCode: (code: string) => void;
    setPassword: (password: string) => void;
    sendCode: () => void;
    setPage: (page: PasswordLoginPageType) => void;
    clickedReset: boolean;
    doReset: () => void;
}

export function resetPasswordPage({
    t,
    isPhone,
    code,
    inputSize,
    isKeyInputValidate,
    inputType,
    keyValue,
    password,
    sendingCode,
    countdown,
    setPage,
    setCode,
    setPassword,
    sendCode,
    setCountryCode,
    setKeyValue,
    clickedReset,
    doReset,
}: ResetPasswordPageProps): React.ReactNode {
    const canReset =
        isKeyInputValidate && keyValue && validateCode(code) && validatePassword(password);

    return (
        <div className="reset-page-with-email-or-phone login-width-limiter">
            <LoginTitle
                subtitle={t(isPhone ? "reset-password-phone-tips" : "reset-password-email-tips")}
                title={t("reset-password")}
            />
            <Input
                placeholder={t("enter-email-or-phone")}
                prefix={
                    isPhone ? (
                        <Select bordered={false} defaultValue="+86" onChange={setCountryCode}>
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

            <Button
                className="login-big-button login-with-resetting-btn"
                disabled={!canReset}
                loading={clickedReset}
                type="primary"
                onClick={doReset}
            >
                {t("confirm-and-login")}
            </Button>
            <Button
                className="login-big-button"
                type="link"
                onClick={() => setPage(PasswordLoginPageType.Login)}
            >
                {t("back")}
            </Button>
        </div>
    );
}
