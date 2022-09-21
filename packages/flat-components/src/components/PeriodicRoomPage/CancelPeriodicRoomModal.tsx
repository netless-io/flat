import React from "react";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

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
    const t = useTranslate();
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
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? t("think-again") : t("cancel")}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelPeriodicRoom}>
                    {t("confirm")}
                </Button>,
            ]}
            open={visible}
            title={title}
            onCancel={onCancel}
        >
            {content()}
        </Modal>
    );
};
