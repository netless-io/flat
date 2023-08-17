import "./index.less";

import React, { useCallback, useMemo, useState } from "react";
import { Button, Form, message, Modal } from "antd";
import { useTranslate, FlatI18nTFunction } from "@netless/flat-i18n";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAgreement, LoginAgreementProps } from "../LoginAgreement";
import { LoginButtons, LoginButtonsDescription, LoginButtonsProps } from "../LoginButtons";
import { LoginPanelContent } from "../LoginPanelContent";
import { LoginButtonProviderType } from "../LoginButton";
import { LoginAccount, PasswordLoginType, defaultCountryCode } from "../LoginAccount";
import { LoginSendCode } from "../LoginSendCode";
import { phoneValidator } from "../LoginWithPassword/validators";
import { codeValidator } from "./validators";
export * from "../LoginButtons";
export * from "./validators";

export interface LoginWithCodeProps {
    buttons?: LoginButtonProviderType[];
    privacyURL?: LoginAgreementProps["privacyURL"];
    serviceURL?: LoginAgreementProps["serviceURL"];
    onClickButton: LoginButtonsProps["onClick"];
    sendVerificationCode: (countryCode: string, phone: string) => Promise<boolean>;
    loginOrRegister: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    loginWithPassword: () => void;
}

interface LoginFormValues {
    phone: string;
    code: string;
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

    const [form] = Form.useForm<LoginFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);
    const type = PasswordLoginType.Phone;

    const defaultValues = {
        phone: "",
        code: "",
    };

    const key = "login";
    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [agreed, setAgreed] = useState(false);
    const [clickedLogin, setClickedLogin] = useState(false);

    const login = useCallback(async () => {
        if (!agreed) {
            if (!(await requestAgreement({ t, privacyURL, serviceURL }))) {
                return;
            }
            setAgreed(true);
        }
        if (isFormValidated) {
            setClickedLogin(true);
            const { phone, code } = form.getFieldsValue();

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
        countryCode,
        form,
        isFormValidated,
        loginOrRegister,
        privacyURL,
        serviceURL,
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

    const handleSendVerificationCode = async (): Promise<boolean> => {
        const { phone } = form.getFieldsValue();
        return sendVerificationCode(countryCode, phone);
    };

    const formValidateStatus = useCallback(() => {
        setIsFormValidated(
            form.getFieldsError().every(field => field.errors.length <= 0) &&
                Object.values(form.getFieldsValue()).every(v => !!v),
        );

        if (form.getFieldValue("phone") && !form.getFieldError("phone").length) {
            setIsAccountValidated(true);
        } else {
            setIsAccountValidated(false);
        }
    }, [form]);

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
                                form.setFieldsValue({
                                    phone: ev.currentTarget.value,
                                    code: "666666",
                                });
                                setAgreed(true);
                                formValidateStatus();
                            }}
                        >
                            {Array.from({ length: 9 }, (_, i) => (
                                <option key={i} value={"13" + String(i + 1).repeat(9)}>
                                    13{i + 1}
                                </option>
                            ))}
                        </select>
                    ) : null}

                    <Form
                        form={form}
                        initialValues={defaultValues}
                        name="loginWithCode"
                        onFieldsChange={formValidateStatus}
                    >
                        <Form.Item name="phone" rules={[phoneValidator]}>
                            <LoginAccount
                                countryCode={countryCode}
                                handleCountryCode={code => setCountryCode(code)}
                                onlyPhone={true}
                                placeholder={t("enter-phone")}
                            />
                        </Form.Item>

                        <Form.Item name="code" rules={[codeValidator]}>
                            <LoginSendCode
                                isAccountValidated={isAccountValidated}
                                sendVerificationCode={handleSendVerificationCode}
                                type={type}
                            />
                        </Form.Item>
                    </Form>

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
                        disabled={!isFormValidated}
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
