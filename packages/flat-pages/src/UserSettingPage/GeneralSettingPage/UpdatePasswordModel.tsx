import { Button, Form, Modal, message } from "antd";
import React, { useCallback, useState } from "react";
import { LoginPassword, errorTips, passwordValidator } from "flat-components";
import { UpdatePwdPayload, updatePassword } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { globalStore } from "@netless/flat-stores";

import { useSafePromise } from "../../utils/hooks/lifecycle";
import { newPassword2Validator } from "./validator";

export interface UpdatePasswordFormValues {
    password?: string;
    newPassword1: string;
    newPassword2: string;
}

export interface UpdatePasswordModelProps {
    visible: boolean;
    title: string;
    showOldPassword: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const UpdatePasswordModel: React.FC<UpdatePasswordModelProps> = ({
    visible,
    title,
    showOldPassword,
    onCancel,
    onConfirm,
}) => {
    const t = useTranslate();
    const sp = useSafePromise();

    const [form] = Form.useForm<UpdatePasswordFormValues>();
    const [isFormValidated, setIsFormValidated] = useState(false);

    const defaultValues = {
        newPassword1: "",
        newPassword2: "",
        password: "",
    };

    const [loading, setLoading] = useState(false);

    const clearAll = useCallback((): void => {
        form.resetFields();
    }, [form]);

    const onOk = useCallback(async () => {
        const { password, newPassword1 } = form.getFieldsValue();

        const payload: UpdatePwdPayload = { newPassword: newPassword1 };

        if (showOldPassword) {
            payload.password = password;
        }

        try {
            setLoading(true);
            await sp(updatePassword(payload));

            if (globalStore.currentAccount) {
                globalStore.updateAccountHistory({
                    key: globalStore.currentAccount.key,
                    password: newPassword1,
                });
            }

            message.success(
                showOldPassword ? t("password-update-success") : t("password-set-success"),
            );
            setLoading(false);

            setIsFormValidated(false);
            clearAll();
            onConfirm();
        } catch (e) {
            setLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [clearAll, form, onConfirm, showOldPassword, sp, t]);

    const formValidateStatus = useCallback(() => {
        setIsFormValidated(
            form.getFieldsError().every(field => field.errors.length <= 0) &&
                Object.values(form.getFieldsValue()).every(v => !!v),
        );
    }, [form]);

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
                name="resetPassword"
                onFieldsChange={formValidateStatus}
            >
                {showOldPassword && (
                    <Form.Item
                        name="password"
                        rules={[
                            { message: t("old-password-required"), required: true },
                            passwordValidator,
                        ]}
                    >
                        <LoginPassword placeholder={t("enter-old-password")} />
                    </Form.Item>
                )}

                <Form.Item name="newPassword1" rules={[passwordValidator]}>
                    <LoginPassword placeholder={t("enter-new-password")} />
                </Form.Item>

                <Form.Item
                    name="newPassword2"
                    rules={[{ validator: newPassword2Validator(form.getFieldsValue()) }]}
                >
                    <LoginPassword placeholder={t("enter-new-password-again")} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
