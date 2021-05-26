import emptyHistorySVG from "../../../assets/image/empty-history.svg";
// import emptyBoxSVG from "../../../assets/image/empty-box.svg";
import emptyRoomSVG from "../../../assets/image/empty-room.svg";

import { clipboard } from "electron";
import { message, Skeleton } from "antd";
import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { isSameDay } from "date-fns";
import {
    InviteModal,
    RemoveRoomModal,
    RoomListDate,
    RoomListItem,
    RoomListItemButton,
    RoomStatusType,
} from "flat-components";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { RoomStatus, RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RemoveHistoryRoomModal } from "../../../components/Modal/RemoveHistoryRoomModal";
import { GlobalStoreContext, RoomStoreContext } from "../../../components/StoreProvider";
import { errorTips } from "../../../components/Tips/ErrorTips";
import { RoomItem } from "../../../stores/RoomStore";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { joinRoomHandler } from "../../utils/joinRoomHandler";

export interface MainRoomListProps {
    listRoomsType: ListRoomsType;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({ listRoomsType }) {
    const roomStore = useContext(RoomStoreContext);
    const [roomUUIDs, setRoomUUIDs] = useState<string[]>();
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [removeHistoryVisible, setRemoveHistoryVisible] = useState(false);
    const [removeHistoryLoading, setRemoveHistoryLoading] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<RoomItem | undefined>(undefined);
    const pushHistory = usePushHistory();
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const isHistoryList = listRoomsType === ListRoomsType.History;

    const refreshRooms = useCallback(
        async function refreshRooms(): Promise<void> {
            try {
                const roomUUIDs = await sp(roomStore.listRooms(listRoomsType, { page: 1 }));
                setRoomUUIDs(roomUUIDs);
            } catch (e) {
                setRoomUUIDs([]);
                errorTips(e);
            }
        },
        [listRoomsType, roomStore, sp],
    );

    useEffect(() => {
        void refreshRooms();

        const ticket = window.setInterval(refreshRooms, 30 * 1000);

        return () => {
            window.clearInterval(ticket);
        };
    }, [refreshRooms]);

    if (!roomUUIDs) {
        return (
            <div className="main-room-list-skeletons">
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton
                            key={i}
                            active
                            title={false}
                            paragraph={{ rows: 4, width: ["13%", "50%", "13%", "13%"] }}
                        />
                    ))}
            </div>
        );
    }

    if (roomUUIDs.length <= 0) {
        return (
            <div className="room-empty-box">
                <img src={isHistoryList ? emptyHistorySVG : emptyRoomSVG} alt={"emptyBoxSVG"} />
                <span>{isHistoryList ? "暂无记录" : "暂无房间"}</span>
            </div>
        );
    }

    const periodicInfo = currentRoom?.periodicUUID
        ? roomStore.periodicRooms.get(currentRoom?.periodicUUID)
        : undefined;

    return (
        <>
            {customSort(roomUUIDs.map(roomUUID => roomStore.rooms.get(roomUUID))).map(
                (room, index, rooms) => {
                    if (!room) {
                        return null;
                    }

                    const lastRoom = index > 0 ? rooms[index - 1] : void 0;
                    // const nextRoom = index < rooms.length - 1 ? rooms[index + 1] : void 0;

                    // show date title when two adjacent rooms are not the same day
                    const shouldShowDate = !(
                        room.beginTime &&
                        lastRoom?.beginTime &&
                        isSameDay(room.beginTime, lastRoom.beginTime)
                    );

                    // show divider when two adjacent rooms are not the same day
                    // const shouldShowDivider = !(
                    //     room.beginTime &&
                    //     nextRoom?.beginTime &&
                    //     isSameDay(room.beginTime, nextRoom.beginTime)
                    // );

                    const beginTime = room.beginTime ? new Date(room.beginTime) : void 0;
                    const endTime = room.endTime ? new Date(room.endTime) : void 0;

                    const primaryAction: RoomListItemButton<"replay" | "join"> = isHistoryList
                        ? { key: "replay", text: "回放", disabled: !room.hasRecord }
                        : { key: "join", text: "加入" };

                    return (
                        <Fragment key={room.roomUUID}>
                            {shouldShowDate && beginTime && <RoomListDate date={beginTime} />}
                            <RoomListItem
                                title={room.title!}
                                beginTime={beginTime}
                                endTime={endTime}
                                status={getRoomStatus(room.roomStatus)}
                                isPeriodic={!!room.periodicUUID}
                                buttons={[getSubActions(room), primaryAction]}
                                onClickMenu={key => {
                                    switch (key) {
                                        case "details": {
                                            pushHistory(RouteNameType.RoomDetailPage, {
                                                roomUUID: room.roomUUID,
                                                periodicUUID: room.periodicUUID,
                                            });
                                            break;
                                        }
                                        case "modify": {
                                            pushHistory(RouteNameType.ModifyOrdinaryRoomPage, {
                                                roomUUID: room.roomUUID,
                                                periodicUUID: room.periodicUUID,
                                            });
                                            break;
                                        }
                                        case "cancel": {
                                            setCurrentRoom(room);
                                            setCancelModalVisible(true);
                                            break;
                                        }
                                        case "invite": {
                                            setCurrentRoom(room);
                                            setInviteModalVisible(true);
                                            break;
                                        }
                                        case "delete-history": {
                                            setCurrentRoom(room);
                                            setRemoveHistoryVisible(true);
                                            break;
                                        }
                                        case "replay": {
                                            replayRoom({
                                                ownerUUID: room.ownerUUID,
                                                roomUUID: room.roomUUID,
                                                roomType: room.roomType || RoomType.OneToOne,
                                            });
                                            break;
                                        }
                                        case "join": {
                                            void joinRoomHandler(room.roomUUID, pushHistory);
                                            break;
                                        }
                                        default:
                                    }
                                }}
                            />
                        </Fragment>
                    );
                },
            )}
            {currentRoom && (
                <RemoveRoomModal
                    cancelModalVisible={cancelModalVisible}
                    onCancel={hideCancelModal}
                    isCreator={currentRoom.ownerUUID === globalStore.userUUID}
                    onCancelRoom={removeRoomHandler}
                    roomUUID={currentRoom.roomUUID}
                    periodicUUID={currentRoom.periodicUUID}
                    isPeriodicDetailsPage={false}
                />
            )}
            {currentRoom && (
                <InviteModal
                    visible={inviteModalVisible}
                    room={currentRoom}
                    userName={globalStore.userName ?? ""}
                    periodicWeeks={periodicInfo?.periodic.weeks}
                    onCopy={onCopy}
                    onCancel={hideInviteModal}
                />
            )}
            {currentRoom && (
                <RemoveHistoryRoomModal
                    visible={removeHistoryVisible}
                    onConfirm={removeConfirm}
                    onCancel={hideRemoveHistoryModal}
                    loading={removeHistoryLoading}
                />
            )}
        </>
    );

    function replayRoom(config: { roomUUID: string; ownerUUID: string; roomType: RoomType }): void {
        pushHistory(RouteNameType.ReplayPage, config);
    }

    function hideCancelModal(): void {
        setCancelModalVisible(false);
    }

    function hideInviteModal(): void {
        setInviteModalVisible(false);
    }

    function hideRemoveHistoryModal(): void {
        setRemoveHistoryVisible(false);
    }

    function onCopy(text: string): void {
        clipboard.writeText(text);
        void message.success("复制成功");
        hideInviteModal();
    }

    async function removeRoomHandler(isCancelAll: boolean): Promise<void> {
        const { ownerUUID, roomUUID, periodicUUID } = currentRoom!;
        const isCreator = ownerUUID === globalStore.userUUID;
        try {
            if (!isCreator && periodicUUID) {
                await roomStore.cancelRoom({
                    all: true,
                    periodicUUID,
                });
            } else {
                await roomStore.cancelRoom({
                    all: isCancelAll || (!roomUUID && !!periodicUUID),
                    roomUUID,
                    periodicUUID,
                });
            }
            setCancelModalVisible(false);
            void refreshRooms();
            const content = isCreator ? "已取消该房间" : "已移除该房间";
            void message.success(content);
        } catch (e) {
            console.error(e);
            errorTips(e);
        }
    }

    async function removeConfirm(): Promise<void> {
        setRemoveHistoryLoading(true);
        try {
            await sp(
                roomStore.cancelRoom({
                    isHistory: true,
                    roomUUID: currentRoom!.roomUUID,
                }),
            );
            hideRemoveHistoryModal();
            void refreshRooms();
        } catch (e) {
            console.error(e);
            errorTips(e);
        } finally {
            setRemoveHistoryLoading(false);
        }
    }

    type SubActions =
        | Array<{ key: "details" | "delete-history"; text: string }>
        | Array<{ key: "details" | "modify" | "cancel" | "invite"; text: string }>;

    function getSubActions(room: RoomItem): SubActions {
        const result = [{ key: "details", text: "房间详情" }];
        if (isHistoryList) {
            if (room.roomUUID) {
                result.push({ key: "delete-history", text: "删除记录" });
            }
        } else {
            const ownerUUID = room.ownerUUID;
            const isCreator = ownerUUID === globalStore.userUUID;
            if (
                (room.roomUUID || room.periodicUUID) &&
                isCreator &&
                room.roomStatus === RoomStatus.Idle
            ) {
                result.push({ key: "modify", text: "修改房间" });
            }
            if (!isCreator || room.roomStatus === RoomStatus.Idle) {
                result.push({ key: "cancel", text: isCreator ? "取消房间" : "移除房间" });
            }
            if (room.roomUUID) {
                result.push({ key: "invite", text: "复制邀请" });
            }
        }
        return result as SubActions;
    }

    function customSort(rooms: Array<RoomItem | undefined>): Array<RoomItem | undefined> {
        if (listRoomsType === ListRoomsType.History) {
            return rooms.sort((a, b) => (a && b ? Number(b.beginTime) - Number(a.beginTime) : 0));
        } else {
            return rooms;
        }
    }

    function getRoomStatus(roomStatus?: RoomStatus): RoomStatusType {
        switch (roomStatus) {
            case RoomStatus.Idle: {
                return "idle";
            }
            case RoomStatus.Started:
            case RoomStatus.Paused: {
                return "running";
            }
            case RoomStatus.Stopped: {
                return "stopped";
            }
            default: {
                return "idle";
            }
        }
    }
});
