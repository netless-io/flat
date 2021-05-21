import React from "react";
import { Button, Modal } from "antd";

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
    const title = (() => {
        if (!isCreator) {
            return "移除房间";
        }

        return "取消周期性房间";
    })();

    const content = (): React.ReactElement => {
        if (!isCreator) {
            return <span>确定从房间列表中移除该系列周期性房间？移除后可通过房间号再次加入。</span>;
        }

        return <span>确定取消该周期性房间？取消后其他成员将无法加入。</span>;
    };

    return (
        <Modal
            visible={visible}
            title={title}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? "再想想" : "取消"}
                </Button>,
                <Button key="Ok" type="primary" onClick={onCancelPeriodicRoom}>
                    确定
                </Button>,
            ]}
        >
            {content()}
        </Modal>
    );
};
