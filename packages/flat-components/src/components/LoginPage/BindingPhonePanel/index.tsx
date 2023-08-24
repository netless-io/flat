import "./index.less";

import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { Button, message, Form, Modal } from "antd";
import React, { useCallback, useState } from "react";

import { useSafePromise } from "../../../utils/hooks";
import { LoginTitle } from "../LoginTitle";
import { LoginAccount, PasswordLoginType, defaultCountryCode } from "../LoginAccount";
import { LoginSendCode } from "../LoginSendCode";
import { codeValidator } from "../LoginWithCode/validators";
import { phoneValidator } from "../LoginWithPassword/validators";
import { BindingPhoneSendCodeResult } from "@netless/flat-server-api";

export interface BindingPhonePanelProps {
    cancelBindingPhone: () => void;
    bindingPhone: (countryCode: string, phone: string, code: string) => Promise<boolean>;
    sendBindingPhoneCode: (
        countryCode: string,
        phone: string,
    ) => Promise<BindingPhoneSendCodeResult>;
    needRebindingPhone: (phone: string) => void;
}

interface BindingFormValues {
    phone: string;
    code: string;
}

export const BindingPhonePanel: React.FC<BindingPhonePanelProps> = ({
    sendBindingPhoneCode,
    cancelBindingPhone,
    bindingPhone,
    needRebindingPhone,
}) => {
    const sp = useSafePromise();
    const t = useTranslate();

    const [form] = Form.useForm<BindingFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);
    const type = PasswordLoginType.Phone;

    const defaultValues = {
        phone: "",
        code: "",
    };

    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [clickedBinding, setClickedBinding] = useState(false);

    const bindPhone = useCallback(async () => {
        if (isFormValidated && bindingPhone) {
            setClickedBinding(true);
            const { phone, code } = form.getFieldsValue();
            const success = await sp(bindingPhone(countryCode, phone, code));
            if (success) {
                await sp(new Promise(resolve => setTimeout(resolve, 60000)));
            } else {
                message.error(t("bind-phone-failed"));
            }
            setClickedBinding(false);
        }
    }, [bindingPhone, form, countryCode, isFormValidated, sp, t]);

    const sendVerificationCode = async (): Promise<BindingPhoneSendCodeResult> => {
        const { phone } = form.getFieldsValue();
        return sendBindingPhoneCode(countryCode, phone);
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

    const onRebinding = async (): Promise<void> => {
        const { phone } = form.getFieldsValue();
        if (await requestRebinding({ t })) {
            needRebindingPhone(phone);
        }
    };

    return (
        <div className="login-with-phone-binding">
            <div className="login-width-limiter">
                <LoginTitle subtitle={t("need-bind-phone")} title={t("bind-phone")} />

                <Form
                    form={form}
                    initialValues={defaultValues}
                    name="loginWithPassword"
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
                            sendVerificationCode={sendVerificationCode}
                            type={type}
                            onRebinding={onRebinding}
                        />
                    </Form.Item>
                </Form>
                <Button
                    className="login-big-button"
                    disabled={!isFormValidated}
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
};

export interface RequestRebindingParams {
    t: FlatI18nTFunction;
}

export function requestRebinding({ t }: RequestRebindingParams): Promise<boolean> {
    return new Promise<boolean>(resolve =>
        Modal.confirm({
            content: <div>{t("rebinding-phone-tips")}</div>,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
        }),
    );
}
