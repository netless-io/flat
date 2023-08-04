import { Button, Input, Modal, message } from "antd";
import { errorTips, validatePassword } from "flat-components";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import React, { useCallback, useState } from "react";
import lockSVG from "../icons/lock.svg";
import { useTranslate } from "@netless/flat-i18n";
import { UpdatePwdPayload, updatePassword } from "@netless/flat-server-api";

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

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const onOk = useCallback(async () => {
        if (showOldPassword && !password) {
            message.error(t("old-password-required"));
            return;
        }

        if (!validatePassword(newPassword1) || !validatePassword(newPassword2)) {
            message.error(t("new-password-invalid"));
            return;
        }

        if (newPassword1 !== newPassword2) {
            message.error(t("password-not-match"));
            return;
        }

        const payload: UpdatePwdPayload = { newPassword: newPassword1 };

        if (showOldPassword) {
            payload.password = password;
        }

        try {
            // @TODO update global account history
            setLoading(true);
            await sp(updatePassword(payload));
            message.success(
                showOldPassword ? t("password-update-success") : t("password-set-success"),
            );
            setLoading(false);

            clearAll();
            onConfirm();
        } catch (e) {
            setLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [newPassword1, newPassword2, password, showOldPassword, sp, t, onConfirm]);

    const clearAll = (): void => {
        setPassword("");
        setNewPassword1("");
        setNewPassword2("");
    };

    return (
        <Modal
            centered
            className="update-password-container"
            footer={[
                <Button key="exit-cancel" onClick={onCancel}>
                    {t("cancel")}
                </Button>,
                <Button key="exit-confirm" loading={loading} onClick={onOk}>
                    {t("confirm")}
                </Button>,
            ]}
            open={visible}
            title={title}
            width={352}
            onCancel={onCancel}
        >
            {showOldPassword && (
                <Input.Password
                    className="update-password-input"
                    placeholder={t("enter-old-password")}
                    prefix={<img alt="old-password" src={lockSVG} />}
                    status={!password || validatePassword(password) ? void 0 : "error"}
                    value={password}
                    onChange={ev => setPassword(ev.currentTarget.value)}
                />
            )}

            <Input.Password
                className="update-password-input"
                placeholder={t("enter-new-password")}
                prefix={<img alt="new-password" src={lockSVG} />}
                status={!newPassword1 || validatePassword(newPassword1) ? void 0 : "error"}
                value={newPassword1}
                onChange={ev => setNewPassword1(ev.currentTarget.value)}
            />

            <Input.Password
                className="update-password-input"
                placeholder={t("enter-new-password-again")}
                prefix={<img alt="new-password-again" src={lockSVG} />}
                status={!newPassword2 || validatePassword(newPassword2) ? void 0 : "error"}
                value={newPassword2}
                onChange={ev => setNewPassword2(ev.currentTarget.value)}
            />
        </Modal>
    );
};
