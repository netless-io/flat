import { Button, Checkbox, Menu, message, Modal } from "antd";
import { MenuProps } from "antd/lib/menu";
import { clipboard } from "electron";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { cancelHistoryRoom } from "../../../apiMiddleware/flatServer";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { generateRoutePath, RouteNameType, usePushHistory } from "../../../utils/routes";
import { globalStore } from "../../../stores/GlobalStore";
import { RoomStatus } from "../../../apiMiddleware/flatServer/constants";

export interface MainRoomListItemMenusProps extends MenuProps {
    roomUUID: string;
    periodicUUID?: string;
    isHistoryList: boolean;
    ownerUUID: string;
}

export const MainRoomListItemMenus = React.memo<MainRoomListItemMenusProps>(
    function MainRoomListItemMenus({
        roomUUID,
        periodicUUID,
        isHistoryList,
        ownerUUID,
        onClick,
        ...restProps
    }) {
        const [cancelModalVisible, setCancelModalVisible] = useState(false);
        const [isCancelAll, setIsCancelAll] = useState(false);
        const pushHistory = usePushHistory();
        const roomStore = useContext(RoomStoreContext);

        const roomInfo = roomStore.rooms.get(roomUUID);

        const isCreator = ownerUUID === globalStore.userUUID;

        const modifyButton = (): React.ReactElement => {
            if (isCreator && roomInfo?.roomStatus === RoomStatus.Idle) {
                return (
                    <Menu.Item
                        onClick={() =>
                            pushHistory(RouteNameType.ModifyOrdinaryRoomPage, {
                                roomUUID,
                                periodicUUID: periodicUUID || void 0,
                            })
                        }
                    >
                        修改房间
                    </Menu.Item>
                );
            }

            return <></>;
        };

        const removeButton = (): React.ReactElement => {
            if (isCreator && roomInfo?.roomStatus !== RoomStatus.Idle) {
                return <></>;
            }

            return (
                <Menu.Item onClick={showCancelRoomModal}>
                    {isCreator ? "取消房间" : "移除房间"}
                </Menu.Item>
            );
        };

        return (
            // pass down props so that antd dropdrown menu shadow is rendered properly
            <>
                <Menu {...restProps} onClick={e => e.domEvent.stopPropagation()}>
                    <Menu.Item>
                        <Link
                            to={{
                                pathname: generateRoutePath(RouteNameType.RoomDetailPage, {
                                    roomUUID,
                                    periodicUUID,
                                }),
                            }}
                        >
                            房间详情
                        </Link>
                    </Menu.Item>
                    {isHistoryList ? (
                        <Menu.Item onClick={deleteRoomHistory}>删除记录</Menu.Item>
                    ) : (
                        <>
                            {modifyButton()}
                            {removeButton()}
                            <Menu.Item onClick={copyInvitation}>复制邀请</Menu.Item>
                        </>
                    )}
                </Menu>
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
                    {periodicUUID ? (
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

        function hideCancelModal(): void {
            setCancelModalVisible(false);
        }

        async function confirmCancelRoom(): Promise<void> {
            setCancelModalVisible(false);
            await cancelRoom();
        }

        function showCancelRoomModal(): void {
            setIsCancelAll(false);
            setCancelModalVisible(true);
        }

        async function cancelRoom(): Promise<void> {
            try {
                await roomStore.cancelRoom({
                    all: isCancelAll,
                    roomUUID,
                    periodicUUID,
                });
                message.success("已取消该房间");
            } catch (e) {
                console.error(e);
            }
        }

        async function deleteRoomHistory(): Promise<void> {
            try {
                await cancelHistoryRoom(roomUUID);
            } catch (e) {
                console.error(e);
            }
        }

        function copyInvitation(): void {
            clipboard.writeText(roomUUID);
            message.success("复制成功");
        }
    },
);

export default MainRoomListItemMenus;
