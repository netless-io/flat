import checkedSVG from "./icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, message, Select } from "antd";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginButtons, LoginButtonsDescription, LoginButtonsProps } from "../LoginButtons";
import { COUNTRY_CODES } from "./data";
import { useTranslation } from "react-i18next";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginButtonProviderType } from "../LoginButton";

export * from "../LoginButtons";

// there must only be numbers
function validatePhone(phone: string): boolean {
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
    renderQRCode: () => React.ReactNode;
}

export const LoginWithPhone: React.FC<LoginWithPhoneProps> = ({
    buttons: userButtons,
    privacyURL,
    serviceURL,
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

    const [showQRCode, setShowQRCode] = useState(false);
    const [countryCode, setCountryCode] = useState("+86");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [clickedLogin, setClickedLogin] = useState(false);

    const canLogin = !clickedLogin && validatePhone(phone) && validateCode(code) && agreed;

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
                    setCountdown(--count);
                    if (count === 0) {
                        clearInterval(timer);
                    }
                }, 1000);
            } else {
                message.error(t("send-verify-code-failed"));
            }
        }
    }, [countryCode, phone, sendVerificationCode, sp, t]);

    const login = useCallback(async () => {
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
    }, [canLogin, sp, loginOrRegister, countryCode, phone, code, t]);

    const onClick = useCallback(
        (provider: LoginButtonProviderType) => {
            if (provider === "wechat") {
                setShowQRCode(true);
            } else {
                onClickButton(provider);
            }
        },
        [onClickButton],
    );

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

    return (
        <LoginPanelContent transitionKey={Number(showQRCode)}>
            {showQRCode ? renderQRCodePage() : renderLoginPage()}
        </LoginPanelContent>
    );
};
