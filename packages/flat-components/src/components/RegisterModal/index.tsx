import "./index.less";

import { useTranslate } from "@netless/flat-i18n";
import React, { useCallback, useMemo, useState } from "react";
import { Button, message, Form } from "antd";

import { LoginTitle } from "../LoginPage/LoginTitle";
import { useSafePromise } from "../../utils/hooks";
import { LoginPanelContent } from "../LoginPage/LoginPanelContent";
import { LoginAgreement, LoginAgreementProps } from "../LoginPage/LoginAgreement";
import { LoginAccount, PasswordLoginType, defaultCountryCode } from "../LoginPage/LoginAccount";
import { LoginKeyType, LoginPassword, LoginSendCode, requestAgreement } from "../LoginPage";
import { LoginButtonProviderType } from "../LoginPage/LoginButton";
import {
    LoginButtonsProps,
    LoginButtonsDescription,
    LoginButtons,
} from "../LoginPage/LoginButtons";
import { codeValidator } from "../LoginPage/LoginWithCode/validators";
import {
    emailValidator,
    passwordValidator,
    phoneValidator,
} from "../LoginPage/LoginWithPassword/validators";

interface LoginFormValues {
    key: string;
    password: string;
    code: string;
}

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

    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [type, setType] = useState(PasswordLoginType.Phone);
    const [form] = Form.useForm<LoginFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);

    const defaultValues = {
        key: "",
        password: "",
        code: "",
    };

    const [clickedRegister, setClickedRegister] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const phone = type === PasswordLoginType.Phone;

    const handleSendVerificationCode = async (): Promise<boolean> => {
        const { key: keyValue } = form.getFieldsValue();

        return sendVerificationCode(type, phone ? countryCode + keyValue : keyValue);
    };

    const doRegister = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        setClickedRegister(true);
        const { key: keyValue, code, password } = form.getFieldsValue();

        if (
            await sp(
                register(
                    type,
                    {
                        key: phone ? countryCode + keyValue : keyValue,
                        originKey: keyValue,
                        countryCode: phone ? countryCode : null,
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
    }, [agreed, countryCode, form, type, phone, privacyURL, register, serviceURL, sp, t]);

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

    const [page] = useState("register");

    const formValidateStatus = useCallback(() => {
        // set global status
        setIsFormValidated(
            form.getFieldsError().every(field => field.errors.length <= 0) &&
                Object.values(form.getFieldsValue()).every(v => !!v),
        );

        // set account status used by verification code
        if (form.getFieldValue("key") && !form.getFieldError("key").length) {
            setIsAccountValidated(true);
        } else {
            setIsAccountValidated(false);
        }
    }, [form]);

    return (
        <LoginPanelContent transitionKey={page}>
            <div className="register-content">
                <div className="register-width-limiter">
                    <LoginTitle subtitle=" " title={t("register-title")} />

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
                        className="login-big-button register-with-btn"
                        disabled={!isFormValidated}
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
