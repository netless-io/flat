import React, { useState } from "react";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { Button, Checkbox, Menu, message, Modal } from "antd";
import { observer } from "mobx-react-lite";
import { RoomItem, roomStore } from "../../stores/RoomStore";

interface RemoveRoomItemProps {
    room: RoomItem | undefined;
    isCreator: boolean;
    handleClick?: (roomUUID: string | undefined) => void;
    autoPopupModal?: boolean;
}

export const RemoveRoomItem = observer<RemoveRoomItemProps>(function RemoveButton({
    isCreator,
    room,
    handleClick,
    autoPopupModal = true,
    ...restProps
}) {
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [isCancelAll, setIsCancelAll] = useState(false);

    if (isCreator && room?.roomStatus !== RoomStatus.Idle) {
        return <></>;
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
                    if (handleClick) {
                        handleClick(room?.roomUUID);
                    }
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
                {room?.periodicUUID ? (
                    <Checkbox
                        checked={isCancelAll}
                        onChange={e => setIsCancelAll(e.target.checked)}
                    >
                        取消该系列全部周期性房间
                    </Checkbox>
                ) : (
                    "确定取消该房间吗？"
                )}
            </Modal>
        </>
    );
});
