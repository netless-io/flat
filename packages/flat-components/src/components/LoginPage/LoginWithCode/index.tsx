import checkedSVG from "../icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, message, Modal, Select } from "antd";
import { useTranslate, FlatI18nTFunction } from "@netless/flat-i18n";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginButtons, LoginButtonsDescription, LoginButtonsProps } from "../LoginButtons";
import { COUNTRY_CODES } from "./data";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginButtonProviderType } from "../LoginButton";

export * from "../LoginButtons";

// there must only be numbers
export function validatePhone(phone: string): boolean {
    return phone.length >= 5 && !/\D/.test(phone);
}

export function validateCode(code: string): boolean {
    return code.length === 6;
}

export interface LoginWithCodeProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    onClickButton: LoginButtonsProps["onClick"];
    sendVerificationCode: (countryCode: string, phone: string) => Promise<boolean>;
    loginOrRegister: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    loginWithPassword: () => void;
}

export const LoginWithCode: React.FC<LoginWithCodeProps> = ({
    buttons: userButtons,
    privacyURL,
    serviceURL,
    onClickButton,
    sendVerificationCode,
    loginOrRegister,
    loginWithPassword,
}) => {
    const sp = useSafePromise();
    const t = useTranslate();

    const buttons = useMemo<LoginButtonsDescription>(
        () =>
            userButtons
                ? userButtons.map(e => ({ provider: e, text: t(`login-${e}`) }))
                : [
                      { provider: "wechat", text: t("login-wechat") },
                      { provider: "github", text: t("login-github") },
                  ],
        [t, userButtons],
    );

    const key = "login";
    const isUnMountRef = useIsUnMounted();
    const [countryCode, setCountryCode] = useState("+86");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [clickedLogin, setClickedLogin] = useState(false);

    const canLogin = !clickedLogin && validatePhone(phone) && validateCode(code);

    const sendCode = useCallback(async () => {
        if (validatePhone(phone)) {
            setSendingCode(true);
            const sent = await sp(sendVerificationCode(countryCode, phone));
            setSendingCode(false);
            if (sent) {
                void message.info(t("sent-verify-code-to-phone"));
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
    }, [countryCode, isUnMountRef, phone, sendVerificationCode, sp, t]);

    const login = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        if (canLogin) {
            setClickedLogin(true);
            const success = await sp(loginOrRegister(countryCode, phone, code));
            if (success) {
                await sp(new Promise(resolve => setTimeout(resolve, 60000)));
            } else {
                message.error(t("login-failed"));
            }
            setClickedLogin(false);
        }
    }, [
        agreed,
        canLogin,
        t,
        privacyURL,
        serviceURL,
        sp,
        loginOrRegister,
        countryCode,
        phone,
        code,
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

    return (
        <LoginPanelContent transitionKey={key}>
            <div className="login-with-phone">
                <div className="login-width-limiter">
                    <LoginTitle subtitle=" " />
                    {process.env.DEV ? (
                        <select
                            style={{
                                position: "absolute",
                                height: 32,
                                transform: "translateX(-120%)",
                                opacity: 0,
                                cursor: "pointer",
                            }}
                            onChange={ev => {
                                setPhone(ev.currentTarget.value);
                                setCode("666666");
                                setAgreed(true);
                            }}
                        >
                            {Array.from({ length: 9 }, (_, i) => (
                                <option key={i} value={"13" + String(i + 1).repeat(9)}>
                                    13{i + 1}
                                </option>
                            ))}
                        </select>
                    ) : null}
                    <Input
                        placeholder={t("enter-phone")}
                        prefix={
                            <Select bordered={false} defaultValue="+86" onChange={setCountryCode}>
                                {COUNTRY_CODES.map(code => (
                                    <Select.Option
                                        key={code}
                                        value={`+${code}`}
                                    >{`+${code}`}</Select.Option>
                                ))}
                            </Select>
                        }
                        size="small"
                        status={!phone || validatePhone(phone) ? undefined : "error"}
                        value={phone}
                        onChange={ev => setPhone(ev.currentTarget.value)}
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
                                    disabled={sendingCode || !validatePhone(phone)}
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

                    <div className="login-with-phone-btn-wrapper">
                        <Button type="link" onClick={loginWithPassword}>
                            {t("pwd-login")}
                        </Button>
                    </div>

                    <LoginAgreement
                        checked={agreed}
                        privacyURL={privacyURL}
                        serviceURL={serviceURL}
                        onChange={setAgreed}
                    />
                    <Button
                        className="login-big-button"
                        disabled={!canLogin}
                        loading={clickedLogin}
                        type="primary"
                        onClick={login}
                    >
                        {t("register-or-login")}
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

export interface RequestAgreementParams {
    privacyURL?: string;
    serviceURL?: string;
    t: FlatI18nTFunction;
}

export function requestAgreement({
    t,
    privacyURL,
    serviceURL,
}: RequestAgreementParams): Promise<boolean> {
    return new Promise<boolean>(resolve =>
        Modal.confirm({
            content: (
                <div>
                    {t("have-read-and-agree")}{" "}
                    <a href={privacyURL} rel="noreferrer" target="_blank">
                        {t("privacy-agreement")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a href={serviceURL} rel="noreferrer" target="_blank">
                        {t("service-policy")}
                    </a>
                </div>
            ),
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        }),
    );
}
