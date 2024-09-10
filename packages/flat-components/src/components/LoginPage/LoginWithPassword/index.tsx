import "./index.less";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { Button, Form, message } from "antd";
import { FormInstance } from "antd/es/form";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginPanelContent } from "../LoginPanelContent";
import { requestAgreement } from "../LoginWithCode";
import { LoginAccount, PasswordLoginType, defaultCountryCode } from "../LoginAccount";
import { LoginPassword } from "../LoginPassword";
import { LoginSendCode } from "../LoginSendCode";
import { LoginButtonProviderType } from "../LoginButton";
import { LoginButtonsProps, LoginButtonsDescription, LoginButtons } from "../LoginButtons";
import { phoneValidator, emailValidator, passwordValidator } from "./validators";
import { codeValidator } from "../LoginWithCode/validators";
export * from "../LoginButtons";
export * from "./validators";

export enum PasswordLoginPageType {
    Login = "login",
    Reset = "reset-password",
}

export type LoginKeyType = {
    key: string;
    originKey: string;
    countryCode: string | null;
};

interface LoginFormValues {
    key: string;
    password: string;
    code?: string;
}

export interface LoginWithPasswordProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    accountHistory: Array<{ key: string; password: string; countryCode?: string | null }>;
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

    // specify the current default input method through global variables
    const accountType = process.env.DEFAULT_LOGIN_WAY as PasswordLoginType;

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

    const [agreed, setAgreed] = useState(false);
    const [clickedLogin, setClickedLogin] = useState(false);
    const [clickedReset, setClickedReset] = useState(false);
    const firstAccount = accountHistory.length > 0 ? accountHistory[0] : null;
    const [countryCode, setCountryCode] = useState(
        (firstAccount && firstAccount.countryCode) || defaultCountryCode,
    );
    const [type, setType] = useState(PasswordLoginType.Phone);

    const phone = type === PasswordLoginType.Phone;
    const isResettingPage = page === PasswordLoginPageType.Reset;

    const [form] = Form.useForm<LoginFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);

    const defaultValues = {
        key: firstAccount?.key || "",
        password: firstAccount?.password || "",
        code: undefined,
    };
    const [password, setPassword] = useState(defaultValues.password);

    const doLogin = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        setClickedLogin(true);

        const { key: keyValue, password } = form.getFieldsValue();

        if (
            await sp(
                login(
                    type,
                    {
                        key: phone ? countryCode + keyValue : keyValue,
                        originKey: keyValue,
                        countryCode: phone ? countryCode : null,
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
    }, [agreed, form, sp, login, type, phone, countryCode, t, privacyURL, serviceURL]);

    const doReset = useCallback(async () => {
        setClickedReset(true);

        const { key: keyValue, password, code } = form.getFieldsValue();

        if (
            code &&
            (await sp(
                resetPassword(
                    type,
                    {
                        key: phone ? countryCode + keyValue : keyValue,
                        originKey: keyValue,
                        countryCode: phone ? countryCode : null,
                    },
                    code,
                    password,
                ),
            ))
        ) {
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            message.info(t("reset-failed"));
        }

        setClickedReset(false);
    }, [countryCode, form, phone, resetPassword, sp, t, type]);

    const handleSendVerificationCode = async (): Promise<boolean> => {
        const { key: keyValue } = form.getFieldsValue();

        return sendVerificationCode(type, phone ? countryCode + keyValue : keyValue);
    };

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

    const formValidateStatus = useCallback(() => {
        let condition =
            form.getFieldsError().every(field => field.errors.length <= 0) &&
            !!form.getFieldValue("key") &&
            !!form.getFieldValue("password");

        if (isResettingPage) {
            condition &&= !!form.getFieldValue("code");
        }

        setIsFormValidated(condition);

        if (form.getFieldValue("key") && !form.getFieldError("key").length) {
            setIsAccountValidated(true);
        } else {
            setIsAccountValidated(false);
        }
    }, [form, isResettingPage]);

    useEffect(() => {
        formValidateStatus();
        if (isResettingPage) {
            form.setFieldsValue({ password: "" });
        }
    }, [page, isResettingPage, form, formValidateStatus]);

    function renderLoginPage(): React.ReactNode {
        return (
            <div className="login-with-email">
                <div className="login-width-limiter">
                    <LoginTitle subtitle=" " />

                    <Form
                        form={form}
                        initialValues={defaultValues}
                        name="loginWithPassword"
                        onFieldsChange={formValidateStatus}
                    >
                        <Form.Item name="key" rules={[phone ? phoneValidator : emailValidator]}>
                            <LoginAccount
                                accountHistory={accountHistory}
                                accountType={accountType}
                                countryCode={countryCode}
                                handleCountryCode={code => setCountryCode(code)}
                                handleType={type => setType(type)}
                                password={password}
                                placeholder={t("enter-email-or-phone")}
                                onHistoryChange={options => {
                                    if (options.title) {
                                        setCountryCode(options.title);
                                    }

                                    form.setFieldsValue({
                                        key: options.value,
                                        password: options.key,
                                    });
                                    setPassword(options.key);
                                    formValidateStatus();
                                }}
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[passwordValidator]}>
                            <LoginPassword placeholder={t("enter-password")} />
                        </Form.Item>
                    </Form>

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
                        onChange={checked => {
                            if (checked) {
                                requestAgreement({ t, privacyURL, serviceURL }).then(agreed => {
                                    setAgreed(agreed);
                                });
                            } else {
                                setAgreed(false);
                            }
                        }}
                    />

                    <Button
                        className="login-big-button login-with-email-login-btn"
                        disabled={!isFormValidated}
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
                      form,
                      phone,
                      type,
                      countryCode,
                      accountType,
                      isFormValidated,
                      clickedReset,
                      defaultValues,
                      isAccountValidated,
                      formValidateStatus,
                      setIsAccountValidated,
                      setCountryCode,
                      setType,
                      t,
                      handleSendVerificationCode,
                      setPage,
                      doReset,
                  })
                : renderLoginPage()}
        </LoginPanelContent>
    );
};

export interface ResetPasswordPageProps {
    form: FormInstance;
    phone: boolean;
    type: PasswordLoginType;
    countryCode: string;
    accountType: PasswordLoginType;
    isFormValidated: boolean;
    clickedReset: boolean;
    defaultValues: LoginFormValues;
    isAccountValidated: boolean;
    formValidateStatus: () => void;
    setIsAccountValidated: (validator: boolean) => void;
    t: FlatI18nTFunction;
    setType: (type: PasswordLoginType) => void;
    setCountryCode: (code: string) => void;
    handleSendVerificationCode: () => Promise<boolean>;
    setPage: (page: PasswordLoginPageType) => void;
    doReset: () => void;
}

export function resetPasswordPage({
    form,
    type,
    countryCode,
    accountType,
    isFormValidated,
    phone,
    clickedReset,
    defaultValues,
    isAccountValidated,
    t,
    setType,
    setCountryCode,
    formValidateStatus,
    handleSendVerificationCode,
    setPage,
    doReset,
}: ResetPasswordPageProps): React.ReactNode {
    return (
        <div className="reset-page-with-email-or-phone login-width-limiter">
            <LoginTitle
                subtitle={t(phone ? "reset-password-phone-tips" : "reset-password-email-tips")}
                title={t("reset-password")}
            />

            <Form
                form={form}
                initialValues={defaultValues}
                name="resetPassword"
                onFieldsChange={formValidateStatus}
            >
                <Form.Item name="key" rules={[phone ? phoneValidator : emailValidator]}>
                    <LoginAccount
                        accountType={accountType}
                        countryCode={countryCode}
                        handleCountryCode={code => setCountryCode(code)}
                        handleType={type => setType(type)}
                        placeholder={t("enter-email-or-phone")}
                    />
                </Form.Item>

                <Form.Item name="code" rules={[codeValidator]}>
                    <LoginSendCode
                        isAccountValidated={isAccountValidated}
                        sendVerificationCode={handleSendVerificationCode}
                        type={type}
                    />
                </Form.Item>

                <Form.Item name="password" rules={[passwordValidator]}>
                    <LoginPassword placeholder={t("enter-password")} />
                </Form.Item>
            </Form>

            <Button
                className="login-big-button login-with-resetting-btn"
                disabled={!isFormValidated}
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
