import { observer } from "mobx-react-lite";
import { Button, Checkbox, message, Modal } from "antd";
import React, { useState } from "react";
import { roomStore } from "../../stores/room-store";
import { errorTips } from "../Tips/ErrorTips";

interface RemoveRoomModalProps {
    cancelModalVisible: boolean;
    onCancel: () => void;
    onRemoveRoom?: (roomUUID: string | undefined) => void;
    isCreator: boolean;
    roomUUID?: string;
    periodicUUID?: string;
    isPeriodicDetailsPage: boolean;
}

export const RemoveRoomModal = observer<RemoveRoomModalProps>(function RemoveRoomModal({
    cancelModalVisible,
    onCancel,
    onRemoveRoom,
    isCreator,
    roomUUID,
    periodicUUID,
    isPeriodicDetailsPage,
}) {
    const [isCancelAll, setIsCancelAll] = useState(false);
    const isPeriodicRoom = !!periodicUUID && !roomUUID;
    const isSubPeriodicRoom = periodicUUID && roomUUID;

    const title = (() => {
        if (!isCreator) {
            return "移除房间";
        }

        if (isPeriodicRoom && isPeriodicDetailsPage) {
            return "取消周期性房间";
        }

        return "取消房间";
    })();

    const content = (): React.ReactElement => {
        if (!periodicUUID) {
            if (isCreator) {
                return <span>确定取消该房间？取消后其他成员将无法加入。</span>;
            }

            return <span>确定从房间列表移除该房间？移除后可通过房间号再次加入。</span>;
        }

        if (!isCreator) {
            return <span>确定从房间列表中移除该系列周期性房间？移除后可通过房间号再次加入。</span>;
        }

        if (!isPeriodicDetailsPage) {
            return (
                <>
                    <span>确定取消该房间？</span>
                    <br />
                    <br />
                    <Checkbox
                        checked={isCancelAll}
                        onChange={e => setIsCancelAll(e.target.checked)}
                    >
                        同时取消该系列周期性房间
                    </Checkbox>
                </>
            );
        }

        if (isSubPeriodicRoom) {
            return <span>确定将此房间从该周期性房间中取消？取消后其他成员将无法加入。</span>;
        }

        return <span>确定取消该周期性房间？取消后其他成员将无法加入。</span>;
    };

    const confirmCancelRoom = async (): Promise<void> => {
        try {
            if (!isCreator && periodicUUID) {
                await roomStore.cancelRoom({
                    all: true,
                    periodicUUID,
                });
            } else {
                await roomStore.cancelRoom({
                    all: isCancelAll || isPeriodicRoom,
                    roomUUID,
                    periodicUUID,
                });
            }

            if (onRemoveRoom) {
                onRemoveRoom(roomUUID);
            }

            const content = isCreator ? "已取消该房间" : "已移除该房间";

            void message.success(content);
        } catch (e) {
            console.error(e);
            errorTips(e);
        }
    };

    return (
        <Modal
            visible={cancelModalVisible}
            title={title}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? "再想想" : "取消"}
                </Button>,
                <Button key="Ok" type="primary" onClick={confirmCancelRoom}>
                    确定
                </Button>,
            ]}
        >
            {content()}
        </Modal>
    );
});
