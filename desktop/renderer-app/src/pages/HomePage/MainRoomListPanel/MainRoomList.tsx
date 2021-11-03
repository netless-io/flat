import { clipboard } from "electron";
import { message } from "antd";
import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { isSameDay } from "date-fns";
import {
    InviteModal,
    RemoveRoomModal,
    RoomListAlreadyLoaded,
    RoomListDate,
    RoomListEmpty,
    RoomListItem,
    RoomListItemButton,
    RoomListSkeletons,
    RoomStatusType,
} from "flat-components";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { RoomStatus, RoomType } from "../../../api-middleware/flatServer/constants";
import { RemoveHistoryRoomModal } from "../../../components/Modal/RemoveHistoryRoomModal";
import { GlobalStoreContext, RoomStoreContext } from "../../../components/StoreProvider";
import { errorTips } from "../../../components/Tips/ErrorTips";
import { RoomItem } from "../../../stores/room-store";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { FLAT_WEB_BASE_URL } from "../../../constants/process";
import { useTranslation } from "react-i18next";

export interface MainRoomListProps {
    listRoomsType: ListRoomsType;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({ listRoomsType }) {
    const { t } = useTranslation();
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
        return <RoomListSkeletons />;
    }

    if (roomUUIDs.length <= 0) {
        return <RoomListEmpty isHistory={isHistoryList} />;
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
                        ? { key: "replay", text: t("replay"), disabled: !room.hasRecord }
                        : { key: "join", text: t("join") };

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
            <RoomListAlreadyLoaded />
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
                    baseUrl={FLAT_WEB_BASE_URL}
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
        void message.success(t("copy-success"));
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
            const content = isCreator
                ? t("the-room-has-been-cancelled")
                : t("the-room-has-been-removed");
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
        const result = [{ key: "details", text: t("room-detail") }];
        if (isHistoryList) {
            if (room.roomUUID) {
                result.push({ key: "delete-history", text: t("delete-records") });
            }
        } else {
            const ownerUUID = room.ownerUUID;
            const isCreator = ownerUUID === globalStore.userUUID;
            if (
                (room.roomUUID || room.periodicUUID) &&
                isCreator &&
                room.roomStatus === RoomStatus.Idle
            ) {
                result.push({ key: "modify", text: t("modify-room") });
            }
            if (!isCreator || room.roomStatus === RoomStatus.Idle) {
                result.push({
                    key: "cancel",
                    text: isCreator ? t("cancel-room") : t("remove-room"),
                });
            }
            if (room.roomUUID) {
                result.push({ key: "invite", text: t("copy-invitation") });
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
                return "upcoming";
            }
            case RoomStatus.Started:
            case RoomStatus.Paused: {
                return "running";
            }
            case RoomStatus.Stopped: {
                return "stopped";
            }
            default: {
                return "upcoming";
            }
        }
    }
});
