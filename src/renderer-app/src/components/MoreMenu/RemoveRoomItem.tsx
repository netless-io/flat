import { Button, Checkbox, Menu, message, Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { RoomItem, roomStore } from "../../stores/RoomStore";

interface RemoveRoomItemProps {
    room: RoomItem | undefined;
    isCreator: boolean;
    onRemoveRoom?: (roomUUID: string | undefined) => void;
    autoPopupModal?: boolean;
    disableCancelAll?: boolean;
}

export const RemoveRoomItem = observer<RemoveRoomItemProps>(function RemoveButton({
    isCreator,
    room,
    onRemoveRoom,
    autoPopupModal = true,
    disableCancelAll = false,
    ...restProps
}) {
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [isCancelAll, setIsCancelAll] = useState(false);

    if (isCreator && room?.roomStatus !== RoomStatus.Idle) {
        return null;
    }

    const hideCancelModal = (): void => {
        setCancelModalVisible(false);
    };

    const confirmCancelRoom = async (): Promise<void> => {
        setCancelModalVisible(false);

        try {
            await roomStore.cancelRoom({
                all: isCancelAll,
                roomUUID: room?.roomUUID,
                periodicUUID: room?.periodicUUID,
            });
            if (onRemoveRoom) {
                onRemoveRoom(room?.roomUUID);
            }
            message.success("已取消该房间");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Menu.Item
                {...restProps}
                onClick={() => {
                    if (autoPopupModal) {
                        setCancelModalVisible(true);
                    }
                }}
            >
                {isCreator ? "取消房间" : "移除房间"}
            </Menu.Item>
            <Modal
                visible={cancelModalVisible}
                title="取消房间"
                onCancel={hideCancelModal}
                onOk={confirmCancelRoom}
                footer={[
                    <Button key="Cancel" onClick={hideCancelModal}>
                        再想想
                    </Button>,
                    <Button key="Ok" type="primary" onClick={confirmCancelRoom}>
                        确定
                    </Button>,
                ]}
            >
                {room?.periodicUUID && !disableCancelAll ? (
                    <>
                        <p>确定取消该单个周期性子房间？</p>
                        <Checkbox
                            checked={isCancelAll}
                            onChange={e => setIsCancelAll(e.target.checked)}
                        >
                            取消该系列全部周期性房间
                        </Checkbox>
                    </>
                ) : (
                    "确定取消该房间？"
                )}
            </Modal>
        </>
    );
});
