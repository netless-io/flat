import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

interface ExitReplayConfirmModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ExitReplayConfirmModal = observer<ExitReplayConfirmModalProps>(
    function ExitReplayConfirmModal({ visible, onCancel, onConfirm }) {
        const t = useTranslate();
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
                open={visible}
                title={t("exit-replay")}
                onCancel={onCancel}
            >
                {t("exit-reply-tips")}
            </Modal>
        );
    },
);
