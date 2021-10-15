import { Menu } from "antd";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { RoomItem, roomStore } from "../../stores/room-store";
import { RemoveHistoryRoomModal } from "../Modal/RemoveHistoryRoomModal";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { errorTips } from "../Tips/ErrorTips";

interface DeleteRoomHistoryItemProps extends MenuItemProps {
    room: RoomItem | undefined;
    onRemoveRoom?: (roomUUID?: string) => void;
}

export const DeleteRoomHistoryItem = observer<DeleteRoomHistoryItemProps>(
    function DeleteRoomHistoryItem({ room, onRemoveRoom, onClick, ...restProps }) {
        const [showRemoveHistoryRoomModal, setShowRemoveHistoryRoomModal] = useState(false);
        const [loading, setLoading] = useState(false);
        const sp = useSafePromise();

        if (!room?.roomUUID) {
            return null;
        }

        const removeConfirm = async (): Promise<void> => {
            setLoading(true);
            try {
                await sp(
                    roomStore.cancelRoom({
                        isHistory: true,
                        roomUUID: room?.roomUUID,
                    }),
                );
                onRemoveRoom?.(room?.roomUUID);
                setShowRemoveHistoryRoomModal(false);
            } catch (e) {
                console.error(e);
                errorTips(e);
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <Menu.Item
                    {...restProps}
                    onClick={e => {
                        if (onClick) {
                            onClick(e);
                        }

                        setShowRemoveHistoryRoomModal(true);
                    }}
                >
                    删除记录
                </Menu.Item>
                <RemoveHistoryRoomModal
                    visible={showRemoveHistoryRoomModal}
                    onConfirm={removeConfirm}
                    onCancel={() => setShowRemoveHistoryRoomModal(false)}
                    loading={loading}
                />
            </>
        );
    },
);
