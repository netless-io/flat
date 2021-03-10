import React from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";

interface RemoveHistoryRoomModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const RemoveHistoryRoomModal = observer<RemoveHistoryRoomModalProps>(
    function RemoveHistoryRoomModal({ visible, onCancel, onConfirm, loading }) {
        return (
            <Modal
                title={"删除房间记录"}
                visible={visible}
                onCancel={onCancel}
                footer={[
                    <Button key="exit-cancel" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key="exit-confirm" danger loading={loading} onClick={onConfirm}>
                        确定
                    </Button>,
                ]}
            >
                确定删除当前房间记录？
            </Modal>
        );
    },
);
