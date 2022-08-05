import React, { FC } from "react";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";

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
    const t = useTranslate();
    return (
        <Modal
            okButtonProps={{ loading }}
            title={t("confirmation-of-the-end-of-classes")}
            visible={visible}
            onCancel={onCancel}
            onOk={onStop}
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
    const t = useTranslate();
    return (
        <Modal
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {t("cancel")}
                </Button>,
                <Button key="ReturnMain" loading={hangLoading} onClick={onHang}>
                    {t("hang-up-the-room")}
                </Button>,
                <Button key="StopClass" loading={stopLoading} type="primary" onClick={onStop}>
                    {t("end-the-class")}
                </Button>,
            ]}
            title={t("close-option")}
            visible={visible}
            onCancel={onCancel}
            onOk={onCancel}
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
    const t = useTranslate();
    return (
        <Modal
            title={t("student-sure-to-exit-the-room")}
            visible={visible}
            onCancel={onCancel}
            onOk={onExit}
        >
            <p>{t("student-exit-room-tip")}</p>
        </Modal>
    );
};
