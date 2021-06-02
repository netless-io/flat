import React from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

export interface CancelPeriodicRoomModalProps {
    visible: boolean;
    isCreator: boolean;
    onCancel: () => void;
    onCancelPeriodicRoom: () => void;
}

export const CancelPeriodicRoomModal: React.FC<CancelPeriodicRoomModalProps> = ({
    visible,
    isCreator,
    onCancel,
    onCancelPeriodicRoom,
}) => {
    const { t } = useTranslation();
    const title = (() => {
        if (!isCreator) {
            return t("remove-room");
        }

        return t("cancel-of-periodic-rooms");
    })();

    const content = (): React.ReactElement => {
        if (!isCreator) {
            return <span>{t("remove-series-of-periodic-room-tips")}</span>;
        }

        return <span>{t("cancel-periodic-room-tips")}</span>;
    };

    return (
        <Modal
            visible={visible}
            title={title}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? t("think-again") : t("cancel")}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelPeriodicRoom}>
                    {t("confirm")}
                </Button>,
            ]}
        >
            {content()}
        </Modal>
    );
};
