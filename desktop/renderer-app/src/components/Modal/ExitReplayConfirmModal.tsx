import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";

interface ExitReplayConfirmModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ExitReplayConfirmModal = observer<ExitReplayConfirmModalProps>(
    function ExitReplayConfirmModal({ visible, onCancel, onConfirm }) {
        return (
            <Modal
                title={"退出回放"}
                visible={visible}
                onCancel={onCancel}
                footer={[
                    <Button key="exit-cancel" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key="exit-confirm" onClick={onConfirm}>
                        确定
                    </Button>,
                ]}
            >
                确定退出回放？
            </Modal>
        );
    },
);
