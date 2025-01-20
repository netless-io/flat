/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { FC, useEffect } from "react";
import { Button, Modal } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { SVGGood } from "../../FlatIcons/icons/SVGGood";

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
            open={visible}
            title={t("confirmation-of-the-end-of-classes")}
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
    rateModal?: React.ReactNode;
    onHang: () => void;
    onStop: () => void;
    onCancel: () => void;
    setGrade?: () => Promise<void>;
}

/**
 * When room creator presses the exit button.
 * [cancel] [hang] [stop]
 */
export const CloseRoomConfirmModal: FC<CloseRoomConfirmModalProps> = ({
    visible,
    hangLoading,
    stopLoading,
    rateModal,
    onHang,
    onStop,
    onCancel,
    setGrade,
}) => {
    const t = useTranslate();
    const [loading, setLoading] = React.useState(false);
    const [showRateModal, setShowRateModal] = React.useState(false);
    const [open, setOpen] = React.useState(visible);
    const handleOk = async () => {
        setLoading(true);
        try {
            if (setGrade) {
                await setGrade();
            }
            setLoading(false);
            setShowRateModal(false);
            onStop();
        } catch (error) {
            console.error(error);
            setLoading(false);
            setShowRateModal(false);
            onCancel();
        }
    };
    const handCancel = async () => {
        setShowRateModal(false);
        onStop();
    };
    useEffect(() => {
        setOpen(visible);
    }, [visible]);
    return (
        <>
            <Modal
                footer={[
                    <Button key="Cancel" onClick={onCancel}>
                        {t("cancel")}
                    </Button>,
                    <Button key="ReturnMain" loading={hangLoading} onClick={onHang}>
                        {t("hang-up-the-room")}
                    </Button>,
                    <Button
                        key="StopClass"
                        loading={stopLoading}
                        type="primary"
                        onClick={() => {
                            if (rateModal) {
                                setShowRateModal(true);
                                setOpen(false);
                            } else {
                                onStop();
                            }
                        }}
                    >
                        {t("end-the-class")}
                    </Button>,
                ]}
                open={open}
                title={t("close-option")}
                onCancel={onCancel}
                onOk={onCancel}
            >
                <p>{t("exit-room-tips")}</p>
            </Modal>
            {showRateModal && (
                <Modal
                    footer={[
                        <Button key="submit" loading={loading} type="primary" onClick={handleOk}>
                            {t("home-page-AI-teacher-modal.rate.submit")}
                        </Button>,
                    ]}
                    open={true}
                    title={
                        <div style={{ display: "flex", alignItems: "stretch" }}>
                            <span>{t("home-page-AI-teacher-modal.rate.title")} </span>
                            <SVGGood />
                        </div>
                    }
                    onCancel={handCancel}
                    onOk={handleOk}
                >
                    {rateModal}
                </Modal>
            )}
        </>
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
            open={visible}
            title={t("student-sure-to-exit-the-room")}
            onCancel={onCancel}
            onOk={onExit}
        >
            <p>{t("student-exit-room-tip")}</p>
        </Modal>
    );
};
