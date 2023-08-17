import { Button, Form, Modal, message } from "antd";
import React, { useCallback, useState } from "react";
import {
    LoginAccount,
    LoginSendCode,
    PasswordLoginType,
    codeValidator,
    phoneValidator,
    errorTips,
    defaultCountryCode,
} from "flat-components";
import { BindingPhonePayload, bindingPhone, bindingPhoneSendCode } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";

import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface UpdatePhoneModelProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
    onRefresh: () => void;
}

export const UpdatePhoneModel: React.FC<UpdatePhoneModelProps> = ({
    visible,
    title,
    onCancel,
    onConfirm,
    onRefresh,
}) => {
    const t = useTranslate();
    const sp = useSafePromise();

    const [form] = Form.useForm<BindingPhonePayload>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);

    const type = PasswordLoginType.Phone;

    const defaultValues = {
        phone: "",
        code: "",
    };

    const [loading, setLoading] = useState(false);
    const [countryCode, setCountryCode] = useState(defaultCountryCode);

    const clearAll = useCallback((): void => {
        onRefresh();
        form.resetFields();
    }, [form, onRefresh]);

    const onOk = useCallback(async () => {
        const { phone, code } = form.getFieldsValue();

        try {
            setLoading(true);
            await sp(bindingPhone(countryCode + phone, Number(code)));

            message.success(t("phone-set-success"));
            setLoading(false);

            setIsFormValidated(false);
            clearAll();
            onConfirm();
        } catch (e) {
            setLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [clearAll, countryCode, form, onConfirm, sp, t]);

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

    const sendVerificationCode = async (): Promise<any> => {
        const { phone } = form.getFieldsValue();
        return bindingPhoneSendCode(countryCode + phone);
    };

    return (
        <Modal
            centered
            forceRender
            footer={[
                <Button key="exit-cancel" onClick={onCancel}>
                    {t("cancel")}
                </Button>,
                <Button
                    key="exit-confirm"
                    disabled={!isFormValidated}
                    loading={loading}
                    onClick={onOk}
                >
                    {t("confirm")}
                </Button>,
            ]}
            open={visible}
            title={title}
            width={352}
            onCancel={onCancel}
        >
            <Form
                form={form}
                initialValues={defaultValues}
                name="rebindPhone"
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
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
