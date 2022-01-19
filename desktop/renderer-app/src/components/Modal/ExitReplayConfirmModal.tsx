import React from "react";
import { Button, Modal } from "antd";
import { observer } from "mobx-react-lite";
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
                footer={[
                    <Button key="exit-cancel" onClick={onCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button key="exit-confirm" onClick={onConfirm}>
                        {t("confirm")}
                    </Button>,
                ]}
                title={t("exit-replay")}
                visible={visible}
                onCancel={onCancel}
            >
                {t("exit-reply-tips")}
            </Modal>
        );
    },
);
