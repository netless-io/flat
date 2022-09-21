import "./style.less";

import { Button, Checkbox, Modal } from "antd";
import React, { useState } from "react";
import { useTranslate } from "@netless/flat-i18n";

export interface RemoveRoomModalProps {
    cancelModalVisible: boolean;
    isCreator: boolean;
    roomUUID?: string;
    periodicUUID?: string;
    isPeriodicDetailsPage: boolean;
    onCancel: () => void;
    onCancelRoom: (all: boolean) => void;
}

export const RemoveRoomModal: React.FC<RemoveRoomModalProps> = ({
    cancelModalVisible,
    isCreator,
    roomUUID,
    periodicUUID,
    isPeriodicDetailsPage,
    onCancel,
    onCancelRoom,
}) => {
    const t = useTranslate();
    const [isCancelAll, setIsCancelAll] = useState(false);
    const isPeriodicRoom = !!periodicUUID && !roomUUID;
    const isSubPeriodicRoom = periodicUUID && roomUUID;

    const title = (() => {
        if (!isCreator) {
            return t("remove-room");
        }

        if (isPeriodicRoom && isPeriodicDetailsPage) {
            return t("cancel-of-periodic-rooms");
        }

        return t("cancel-room");
    })();

    const content = (): React.ReactElement => {
        if (!periodicUUID) {
            if (isCreator) {
                return <span>{t("cancel-general-room-tips")}</span>;
            }

            return <span>{t("remove-general-room-tips")}</span>;
        }

        if (!isCreator) {
            return <span>{t("remove-series-of-periodic-room-tips")}</span>;
        }

        if (!isPeriodicDetailsPage) {
            return (
                <>
                    <span>{t("cancel-periodic-room-tips")}</span>
                    <br />
                    <br />
                    <Checkbox
                        checked={isCancelAll}
                        onChange={e => setIsCancelAll(e.target.checked)}
                    >
                        {t("also-cancel-the-series-of-periodic-rooms")}
                    </Checkbox>
                </>
            );
        }

        if (isSubPeriodicRoom) {
            return <span>{t("cancel-sub-periodic-room-tips")}</span>;
        }

        return <span>{t("cancel-periodic-room-tips")}</span>;
    };

    return (
        <Modal
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? t("think-again") : t("cancel")}
                </Button>,
                <Button
                    key="Ok"
                    type="primary"
                    onClick={() => onCancelRoom(isCancelAll || isPeriodicRoom)}
                >
                    {t("confirm")}
                </Button>,
            ]}
            open={cancelModalVisible}
            title={title}
            wrapClassName="remove-room-modal-container"
            onCancel={onCancel}
        >
            {content()}
        </Modal>
    );
};
