import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

interface ExitReplayConfirmModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ExitReplayConfirmModal = observer<ExitReplayConfirmModalProps>(
    function ExitReplayConfirmModal({ visible, onCancel, onConfirm }) {
        const { t } = useTranslation();
        return (
            <Modal
                title={t("exit-replay")}
                visible={visible}
                onCancel={onCancel}
                footer={[
                    <Button key="exit-cancel" onClick={onCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button key="exit-confirm" onClick={onConfirm}>
                        {t("confirm")}
                    </Button>,
                ]}
            >
                {t("exit-reply-tips")}
            </Modal>
        );
    },
);
