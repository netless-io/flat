import React from "react";
import { Button, Modal } from "antd";

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
    return (
        <Modal
            visible={visible}
            title={"取消房间"}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? "再想想" : "取消"}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelSubPeriodicRoom}>
                    确定
                </Button>,
            ]}
        >
            <span>确定将此房间从该周期性房间中取消？取消后其他成员将无法加入。</span>
        </Modal>
    );
};
