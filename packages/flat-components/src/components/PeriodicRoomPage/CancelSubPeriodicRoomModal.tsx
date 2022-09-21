import React from "react";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface CancelSubPeriodicRoomModalProps {
    visible: boolean;
    isCreator: boolean;
    onCancel: () => void;
    onCancelSubPeriodicRoom: () => void;
}

export const CancelSubPeriodicRoomModal: React.FC<CancelSubPeriodicRoomModalProps> = ({
    visible,
    isCreator,
    onCancel,
    onCancelSubPeriodicRoom,
}) => {
    const t = useTranslate();
    return (
        <Modal
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? t("think-again") : t("cancel")}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelSubPeriodicRoom}>
                    {t("confirm")}
                </Button>,
            ]}
            open={visible}
            title={t("cancel-room")}
            onCancel={onCancel}
        >
            <span>{t("cancel-sub-periodic-room-tips")}</span>
        </Modal>
    );
};
