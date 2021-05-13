import { Button, Modal } from "antd";
import React, { FC } from "react";

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
    return (
        <Modal
            visible={visible}
            title="确定结束上课"
            okButtonProps={{ loading }}
            onOk={onStop}
            onCancel={onCancel}
        >
            <p>
                一旦结束上课，所有用户自动退出房间，并且自动结束课程和录制（如有），不能继续直播。
            </p>
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
    return (
        <Modal
            visible={visible}
            title="关闭选项"
            onOk={onCancel}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    取消
                </Button>,
                <Button key="ReturnMain" loading={hangLoading} onClick={onHang}>
                    挂起房间
                </Button>,
                <Button key="StopClass" type="primary" loading={stopLoading} onClick={onStop}>
                    结束上课
                </Button>,
            ]}
        >
            <p>课堂正在继续，你是暂时退出挂起房间还是结束上课？</p>
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
    return (
        <Modal visible={visible} title="确定退出房间" onOk={onExit} onCancel={onCancel}>
            <p>课堂正在继续，确定退出房间？</p>
        </Modal>
    );
};
