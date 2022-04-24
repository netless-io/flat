import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, message, Modal, Select } from "antd";
import { TFunction } from "i18next";

import { useIsUnMounted, useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginButtons, LoginButtonsDescription, LoginButtonsProps } from "../LoginButtons";
import { COUNTRY_CODES } from "./data";
import { useTranslation } from "react-i18next";
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

export interface LoginWithPhoneProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    onClickButton: LoginButtonsProps["onClick"];
    sendVerificationCode: (countryCode: string, phone: string) => Promise<boolean>;
    loginOrRegister: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    isBindingPhone?: boolean;
    cancelBindingPhone?: () => void;
    sendBindingPhoneCode?: (countryCode: string, phone: string) => Promise<boolean>;
    bindingPhone?: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    renderQRCode: () => React.ReactNode;
}

export const LoginWithPhone: React.FC<LoginWithPhoneProps> = ({
    buttons: userButtons,
    privacyURL,
    serviceURL,
    isBindingPhone,
    cancelBindingPhone,
    sendBindingPhoneCode,
    bindingPhone,
    onClickButton,
    sendVerificationCode,
    loginOrRegister,
    renderQRCode,
}) => {
    const sp = useSafePromise();
    const { t } = useTranslation();

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

    const isUnMountRef = useIsUnMounted();
    const [showQRCode, setShowQRCode] = useState(false);
    const [countryCode, setCountryCode] = useState("+86");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [bindingPhoneCode, setBindingPhoneCode] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [clickedLogin, setClickedLogin] = useState(false);
    const [clickedBinding, setClickedBinding] = useState(false);

    const canLogin = !clickedLogin && validatePhone(phone) && validateCode(code);
    const canBinding = !clickedBinding && validatePhone(phone) && validateCode(bindingPhoneCode);

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
            } else {
                message.error(t("send-verify-code-failed"));
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
            if (provider === "wechat") {
                setShowQRCode(true);
            } else {
                onClickButton(provider);
            }
        },
        [agreed, onClickButton, privacyURL, serviceURL, t],
    );

    const sendBindingCode = useCallback(async () => {
        if (validatePhone(phone) && sendBindingPhoneCode) {
            setSendingCode(true);
            const sent = await sp(sendBindingPhoneCode(countryCode, phone));
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
            } else {
                message.error(t("send-verify-code-failed"));
            }
        }
    }, [countryCode, isUnMountRef, phone, sendBindingPhoneCode, sp, t]);

    const bindPhone = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        if (canBinding && bindingPhone) {
            setClickedBinding(true);
            const success = await sp(bindingPhone(countryCode, phone, bindingPhoneCode));
            if (success) {
                await sp(new Promise(resolve => setTimeout(resolve, 60000)));
            } else {
                message.error(t("bind-phone-failed"));
            }
            setClickedBinding(false);
        }
    }, [
        agreed,
        bindingPhone,
        bindingPhoneCode,
        canBinding,
        countryCode,
        phone,
        privacyURL,
        serviceURL,
        sp,
        t,
    ]);

    function renderQRCodePage(): React.ReactNode {
        return (
            <div className="login-with-wechat">
                <div className="login-width-limiter">
                    <div className="login-qrcode">{renderQRCode()}</div>
                    <Button
                        className="login-btn-back"
                        type="link"
                        onClick={() => setShowQRCode(false)}
                    >
                        {t("back")}
                    </Button>
                </div>
            </div>
        );
    }

    function renderLoginPage(): React.ReactNode {
        return (
            <div className="login-with-phone">
                <div className="login-width-limiter">
                    <LoginTitle />
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
        );
    }

    const key = isBindingPhone ? "bind-phone" : showQRCode ? "qrcode" : "login";

    return (
        <LoginPanelContent transitionKey={key}>
            {isBindingPhone
                ? renderBindPhonePage({
                      t,
                      setCountryCode,
                      phone,
                      setPhone,
                      bindingPhoneCode,
                      countdown,
                      sendingCode,
                      sendBindingCode,
                      setBindingPhoneCode,
                      canBinding,
                      clickedBinding,
                      bindPhone,
                      cancelBindingPhone: () => cancelBindingPhone?.(),
                  })
                : showQRCode
                ? renderQRCodePage()
                : renderLoginPage()}
        </LoginPanelContent>
    );
};

export interface BindingPhonePageProps {
    t: TFunction;
    setCountryCode: (countryCode: string) => void;
    phone: string;
    setPhone: (phone: string) => void;
    bindingPhoneCode: string;
    setBindingPhoneCode: (bindingPhoneCode: string) => void;
    countdown: number;
    sendingCode: boolean;
    sendBindingCode: () => Promise<void>;
    canBinding: boolean;
    clickedBinding: boolean;
    bindPhone: () => Promise<void>;
    cancelBindingPhone: () => void;
}

export interface RequestAgreementParams {
    privacyURL?: string;
    serviceURL?: string;
    t: TFunction;
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

export function renderBindPhonePage({
    t,
    setCountryCode,
    phone,
    setPhone,
    bindingPhoneCode,
    countdown,
    sendingCode,
    sendBindingCode,
    setBindingPhoneCode,
    canBinding,
    clickedBinding,
    bindPhone,
    cancelBindingPhone,
}: BindingPhonePageProps): React.ReactNode {
    return (
        <div className="login-with-phone binding">
            <div className="login-width-limiter">
                <LoginTitle subtitle={t("need-bind-phone")} title={t("bind-phone")} />
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
                    status={
                        !bindingPhoneCode || validateCode(bindingPhoneCode) ? undefined : "error"
                    }
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
                                onClick={sendBindingCode}
                            >
                                {t("send-verify-code")}
                            </Button>
                        )
                    }
                    value={bindingPhoneCode}
                    onChange={ev => setBindingPhoneCode(ev.currentTarget.value)}
                />
                <Button
                    className="login-big-button"
                    disabled={!canBinding}
                    loading={clickedBinding}
                    type="primary"
                    onClick={bindPhone}
                >
                    {t("confirm")}
                </Button>
                <Button className="login-btn-back" type="link" onClick={cancelBindingPhone}>
                    {t("back")}
                </Button>
            </div>
        </div>
    );
}
