import emailSVG from "./icons/email.svg";
import lockSVG from "./icons/lock.svg";
import checkedSVG from "../LoginWithPhone/icons/checked.svg";
import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, message } from "antd";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import {
    LoginButtonProviderType,
    LoginButtons,
    LoginButtonsDescription,
    LoginButtonsProps,
} from "../LoginButtons";
import { LoginPanelContent } from "../LoginPanelContent";
import { validateCode } from "../LoginWithPhone";

export * from "../LoginButtons";

const emailRegex = /^[^.\s@:](?:[^\s@:]*[^\s@:.])?@[^.\s@]+(?:\.[^.\s@]+)*$/;

function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
    return password.length >= 6;
}

export interface LoginWithEmailProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    onClickButton: LoginButtonsProps["onClick"];
    sendVerificationCode: (email: string) => Promise<boolean>;
    verifyEmail: (email: string, code: string) => Promise<boolean>;
    resetPassword: (email: string, code: string, password: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
}

export const LoginWithEmail: React.FC<LoginWithEmailProps> = ({
    buttons: userButtons,
    privacyURL,
    serviceURL,
    onClickButton,
    sendVerificationCode,
    verifyEmail,
    resetPassword,
    login,
    register,
}) => {
    const { t } = useTranslation();
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

    const [page, setPage] = useState<"login" | "verify-email" | "reset-password">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [code, setCode] = useState("");
    const [clickedLogin, setClickedLogin] = useState(false);
    const [clickedRegister, setClickedRegister] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [isSettingPassword, setSettingPassword] = useState(false);
    const [verifiedCode, setVerifiedCode] = useState(false);

    const canLogin =
        !clickedLogin &&
        !clickedRegister &&
        validateEmail(email) &&
        validatePassword(password) &&
        agreed;

    const doLogin = useCallback(async () => {
        setClickedLogin(true);
        if (await sp(login(email, password))) {
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            message.info(t("login-failed"));
        }
        setClickedLogin(false);
    }, [email, login, password, sp, t]);

    const doRegister = useCallback(async () => {
        setClickedRegister(true);
        if (!(await sp(register(email, password)))) {
            message.info(t("register-failed"));
        }
        setClickedRegister(false);
    }, [email, password, register, sp, t]);

    const forgotPassword = useCallback(() => {
        if (agreed) {
            setPage("verify-email");
        } else {
            message.info(t("agree-terms"));
        }
    }, [agreed, t]);

    const sendCode = useCallback(async () => {
        if (validateEmail(email)) {
            setSendingCode(true);
            if (await sp(sendVerificationCode(email))) {
                message.info(t("sent-verify-code-to-email"));
            } else {
                message.info(t("send-verify-code-failed"));
            }
            setSendingCode(false);
        }
    }, [email, sendVerificationCode, sp, t]);

    const doVerifyEmail = useCallback(async () => {
        if (validateEmail(email) && validateCode(code)) {
            setVerifiedCode(false);
            setVerifyingCode(true);
            const verified = await sp(verifyEmail(email, code));
            setVerifyingCode(false);
            if (verified) {
                setPage("reset-password");
                setVerifiedCode(true);
            } else {
                void message.info(t("incorrect-code"));
            }
        }
    }, [code, email, sp, t, verifyEmail]);

    const doResetPassword = useCallback(async () => {
        if (validateEmail(email) && verifiedCode && validatePassword(password)) {
            setSettingPassword(true);
            await sp(resetPassword(email, code, password));
            void message.info(t("has-reset-password"));
            if (await sp(login(email, password))) {
                await new Promise(resolve => setTimeout(resolve, 60000));
            } else {
                message.info(t("login-failed"));
            }
            setSettingPassword(false);
        }
    }, [code, email, login, password, resetPassword, sp, t, verifiedCode]);

    function renderLoginPage(): React.ReactNode {
        return (
            <div className="login-with-email">
                <div className="login-width-limiter">
                    <LoginTitle />
                    <Input
                        placeholder={t("enter-email")}
                        prefix={<img alt="email" src={emailSVG} />}
                        status={!email || validateEmail(email) ? undefined : "error"}
                        type="email"
                        value={email}
                        onChange={ev => setEmail(ev.currentTarget.value)}
                    />
                    <div className="login-with-email-password-btn-wrapper">
                        <Input.Password
                            placeholder={t("enter-password")}
                            prefix={<img alt="password" src={lockSVG} />}
                            value={password}
                            onChange={ev => setPassword(ev.currentTarget.value)}
                        />
                        <Button
                            className="login-with-email-forgot-password-btn"
                            disabled={clickedLogin || clickedRegister}
                            type="link"
                            onClick={forgotPassword}
                        >
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
                    <Button
                        className="login-big-button"
                        disabled={!canLogin}
                        loading={clickedRegister}
                        type="link"
                        onClick={doRegister}
                    >
                        {t("register")}
                    </Button>
                </div>
                <div className="login-splitter">
                    <span className="login-splitter-text">{t("also-login-with")}</span>
                </div>
                <LoginButtons buttons={buttons} onClick={onClickButton} />
            </div>
        );
    }

    function renderVerifyEmailPage(): React.ReactNode {
        return (
            <div className="login-with-email login-with-email-forgot-password">
                <div className="login-width-limiter">
                    <LoginTitle subtitle=" " title={t("reset-password-by-email")} />
                    <Input
                        placeholder={t("enter-email")}
                        prefix={<img alt="email" src={emailSVG} />}
                        status={!email || validateEmail(email) ? undefined : "error"}
                        type="email"
                        value={email}
                        onChange={ev => setEmail(ev.currentTarget.value)}
                    />
                    <Input
                        placeholder={t("enter-code")}
                        prefix={<img alt="code" src={checkedSVG} />}
                        suffix={
                            <Button
                                className="login-with-email-send-code-btn"
                                disabled={sendingCode || !validateEmail(email)}
                                loading={sendingCode}
                                size="small"
                                type="link"
                                onClick={sendCode}
                            >
                                {t("send")}
                            </Button>
                        }
                        value={code}
                        onChange={ev => setCode(ev.currentTarget.value)}
                    />
                    <Button
                        className="login-big-button login-with-email-next-btn"
                        disabled={verifyingCode || !validateEmail(email) || !validateCode(code)}
                        loading={verifyingCode}
                        type="primary"
                        onClick={doVerifyEmail}
                    >
                        {t("next-step")}
                    </Button>
                    <Button
                        className="login-big-button"
                        disabled={verifyingCode}
                        type="link"
                        onClick={() => setPage("login")}
                    >
                        {t("back")}
                    </Button>
                </div>
            </div>
        );
    }

    function renderResetPasswordPage(): React.ReactNode {
        return (
            <div className="login-with-email login-with-email-forgot-password">
                <div className="login-width-limiter">
                    <LoginTitle subtitle=" " title={t("set-new-password")} />
                    <Input
                        placeholder={t("enter-email")}
                        prefix={<img alt="email" src={emailSVG} />}
                        status={!email || validateEmail(email) ? undefined : "error"}
                        type="email"
                        value={email}
                        onChange={ev => setEmail(ev.currentTarget.value)}
                    />
                    <Input.Password
                        placeholder={t("enter-password")}
                        prefix={<img alt="password" src={lockSVG} />}
                        value={password}
                        onChange={ev => setPassword(ev.currentTarget.value)}
                    />
                    <Button
                        className="login-big-button login-with-email-next-btn"
                        disabled={
                            isSettingPassword ||
                            !validateEmail(email) ||
                            !validatePassword(password)
                        }
                        loading={isSettingPassword}
                        type="primary"
                        onClick={doResetPassword}
                    >
                        {t("confirm-and-login")}
                    </Button>
                    <Button
                        className="login-big-button"
                        disabled={isSettingPassword}
                        type="link"
                        onClick={() => setPage("verify-email")}
                    >
                        {t("back")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <LoginPanelContent transitionKey={page}>
            {page === "login"
                ? renderLoginPage()
                : page === "verify-email"
                ? renderVerifyEmailPage()
                : renderResetPasswordPage()}
        </LoginPanelContent>
    );
};
