import { observer } from "mobx-react-lite";
import { Button, Checkbox, message, Modal } from "antd";
import React, { useState } from "react";
import { roomStore } from "../../stores/RoomStore";

interface RemoveRoomModalProps {
    cancelModalVisible: boolean;
    onCancel: () => void;
    onRemoveRoom?: (roomUUID: string | undefined) => void;
    isCreator: boolean;
    roomUUID?: string;
    periodicUUID?: string;
}

export const RemoveRoomModal = observer<RemoveRoomModalProps>(function RemoveRoomModal({
    cancelModalVisible,
    onCancel,
    onRemoveRoom,
    isCreator,
    roomUUID,
    periodicUUID,
}) {
    const [isCancelAll, setIsCancelAll] = useState(false);

    const confirmCancelRoom = async (): Promise<void> => {
        try {
            await roomStore.cancelRoom({
                all: isCancelAll,
                roomUUID,
                periodicUUID,
            });

            if (onRemoveRoom) {
                onRemoveRoom(roomUUID);
            }

            const content = isCreator ? "已取消该房间" : "已移除该房间";

            message.success(content);
        } catch (e) {
            console.error(e);
        }
    };

    const title = isCreator ? "取消房间" : "移除房间";

    return (
        <Modal
            visible={cancelModalVisible}
            title={title}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    再想想
                </Button>,
                <Button key="Ok" type="primary" onClick={confirmCancelRoom}>
                    确定
                </Button>,
            ]}
        >
            {periodicUUID ? (
                <Checkbox checked={isCancelAll} onChange={e => setIsCancelAll(e.target.checked)}>
                    取消该系列全部周期性房间？
                </Checkbox>
            ) : (
                "确定取消该房间？"
            )}
        </Modal>
    );
});
