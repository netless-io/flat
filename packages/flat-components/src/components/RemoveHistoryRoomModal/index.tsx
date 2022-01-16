import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

export interface RemoveHistoryRoomModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const RemoveHistoryRoomModal = observer<RemoveHistoryRoomModalProps>(
    function RemoveHistoryRoomModal({ visible, onCancel, onConfirm, loading }) {
        const { t } = useTranslation();
        return (
            <Modal
                destroyOnClose
                footer={[
                    <Button key="exit-cancel" onClick={onCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button key="exit-confirm" danger loading={loading} onClick={onConfirm}>
                        {t("confirm")}
                    </Button>,
                ]}
                title={t("delete-room-records")}
                visible={visible}
                wrapClassName="remove-history-room-modal-container"
                onCancel={onCancel}
            >
                {t("delete-room-records-tips")}
            </Modal>
        );
    },
);
