import { Button, Form, Modal, message } from "antd";
import React, { useCallback, useState } from "react";
import {
    LoginAccount,
    LoginSendCode,
    PasswordLoginType,
    codeValidator,
    emailValidator,
    errorTips,
} from "flat-components";
import { BindingEmailPayload, bindingEmail, bindingEmailSendCode } from "@netless/flat-server-api";
import { useLanguage, useTranslate } from "@netless/flat-i18n";

import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface UpdateEmailModelProps {
    visible: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
    onRefresh: () => void;
}

export const UpdateEmailModel: React.FC<UpdateEmailModelProps> = ({
    visible,
    title,
    onCancel,
    onConfirm,
    onRefresh,
}) => {
    const language = useLanguage();
    const t = useTranslate();
    const sp = useSafePromise();
    const emailLanguage = language.startsWith("zh") ? "zh" : "en";

    const [form] = Form.useForm<BindingEmailPayload>();
    const [isFormValidated, setIsFormValidated] = useState(false);
    const [isAccountValidated, setIsAccountValidated] = useState(false);

    const type = PasswordLoginType.Email;

    const defaultValues = {
        email: "",
        code: "",
    };

    const [loading, setLoading] = useState(false);

    const clearAll = useCallback((): void => {
        onRefresh();
        form.resetFields();
    }, [form, onRefresh]);

    const onOk = useCallback(async () => {
        const { email, code } = form.getFieldsValue();

        try {
            setLoading(true);
            await sp(bindingEmail(email, Number(code)));

            message.success(t("email-set-success"));
            setLoading(false);

            setIsFormValidated(false);
            clearAll();
            onConfirm();
        } catch (e) {
            setLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [clearAll, form, onConfirm, sp, t]);

    const formValidateStatus = useCallback(() => {
        setIsFormValidated(
            form.getFieldsError().every(field => field.errors.length <= 0) &&
                Object.values(form.getFieldsValue()).every(v => !!v),
        );

        if (form.getFieldValue("email") && !form.getFieldError("email").length) {
            setIsAccountValidated(true);
        } else {
            setIsAccountValidated(false);
        }
    }, [form]);

    const sendVerificationCode = async (): Promise<any> => {
        const { email } = form.getFieldsValue();
        return bindingEmailSendCode(email, emailLanguage);
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
                name="rebindEmail"
                onFieldsChange={formValidateStatus}
            >
                <Form.Item name="email" rules={[emailValidator]}>
                    <LoginAccount onlyEmail={true} placeholder={t("enter-email")} />
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
