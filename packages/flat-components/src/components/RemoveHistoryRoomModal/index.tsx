import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface RemoveHistoryRoomModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const RemoveHistoryRoomModal = /* @__PURE__ */ observer<RemoveHistoryRoomModalProps>(
    function RemoveHistoryRoomModal({ visible, onCancel, onConfirm, loading }) {
        const t = useTranslate();
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
                open={visible}
                title={t("delete-room-records")}
                wrapClassName="remove-history-room-modal-container"
                onCancel={onCancel}
            >
                {t("delete-room-records-tips")}
            </Modal>
        );
    },
);
