import React from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            title={t("cancel-room")}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? t("think-again") : t("cancel")}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelSubPeriodicRoom}>
                    {t("confirm")}
                </Button>,
            ]}
        >
            <span>{t("cancel-sub-periodic-room-tips")}</span>
        </Modal>
    );
};
