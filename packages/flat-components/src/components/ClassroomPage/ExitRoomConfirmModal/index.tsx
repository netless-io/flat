import React, { FC } from "react";
import { Button, Modal } from "antd";
import { useTranslation } from "react-i18next";

export interface StopClassConfirmModalProps {
    visible: boolean;
    loading: boolean;
    onStop: () => void;
    onCancel: () => void;
}

/**
 * When room creator presses the the Stop Class button.
 * [cancel] [stop]
 */
export const StopClassConfirmModal: FC<StopClassConfirmModalProps> = ({
    visible,
    loading,
    onStop,
    onCancel,
}) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            title={t("confirmation-of-the-end-of-classes")}
            okButtonProps={{
                loading,
            }}
            onOk={onStop}
            onCancel={onCancel}
        >
            <p>{t("end-of-class-tips")}</p>
        </Modal>
    );
};

export interface CloseRoomConfirmModalProps {
    visible: boolean;
    hangLoading: boolean;
    stopLoading: boolean;
    onHang: () => void;
    onStop: () => void;
    onCancel: () => void;
}

/**
 * When room creator presses the exit button.
 * [cancel] [hang] [stop]
 */
export const CloseRoomConfirmModal: FC<CloseRoomConfirmModalProps> = ({
    visible,
    hangLoading,
    stopLoading,
    onHang,
    onStop,
    onCancel,
}) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            title={t("close-option")}
            onOk={onCancel}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {t("cancel")}
                </Button>,
                <Button key="ReturnMain" loading={hangLoading} onClick={onHang}>
                    {t("hang-up-the-room")}
                </Button>,
                <Button key="StopClass" type="primary" loading={stopLoading} onClick={onStop}>
                    {t("end-the-class")}
                </Button>,
            ]}
        >
            <p>{t("exit-room-tips")}</p>
        </Modal>
    );
};

export interface ExitRoomConfirmModalProps {
    visible: boolean;
    onExit: () => void;
    onCancel: () => void;
}

/**
 * When joiner presses exit room button.
 * [cancel] [ok]
 */
export const ExitRoomConfirmModal: FC<ExitRoomConfirmModalProps> = ({
    visible,
    onExit,
    onCancel,
}) => {
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            title={t("student-sure-to-exit-the-room")}
            onOk={onExit}
            onCancel={onCancel}
        >
            <p>{t("student-exit-room-tip")}</p>
        </Modal>
    );
};
