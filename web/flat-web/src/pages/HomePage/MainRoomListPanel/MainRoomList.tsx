import { message } from "antd";
import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
    InviteModal,
    RemoveHistoryRoomModal,
    RemoveRoomModal,
    RoomListAllLoaded,
    RoomListEmpty,
    RoomListItem,
    RoomListItemPrimaryAction,
    RoomListSkeletons,
    RoomStatusType,
} from "flat-components";
import { ListRoomsType } from "../../../api-middleware/flatServer";
import { RoomStatus, RoomType } from "../../../api-middleware/flatServer/constants";
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
    isLogin: boolean;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({
    listRoomsType,
    isLogin,
}) {
    const { t } = useTranslation();
    const roomStore = useContext(RoomStoreContext);
    const [skeletonsVisible, setSkeletonsVisible] = useState(false);
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

    // Wait 200ms before showing skeletons to reduce flashing.
    useEffect(() => {
        const ticket = window.setTimeout(() => setSkeletonsVisible(true), 200);
        return () => window.clearTimeout(ticket);
    }, []);

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
        if (!isLogin) {
            return;
        }

        void refreshRooms();

        const ticket = window.setInterval(refreshRooms, 30 * 1000);

        return () => {
            window.clearInterval(ticket);
        };
    }, [refreshRooms, isLogin]);

    if (!roomUUIDs) {
        return skeletonsVisible ? <RoomListSkeletons /> : null;
    }

    if (roomUUIDs.length <= 0) {
        return <RoomListEmpty isHistory={isHistoryList} />;
    }

    const periodicInfo = currentRoom?.periodicUUID
        ? roomStore.periodicRooms.get(currentRoom?.periodicUUID)
        : undefined;

    return (
        <>
            {customSort(roomUUIDs.map(roomUUID => roomStore.rooms.get(roomUUID))).map(room => {
                if (!room) {
                    return null;
                }

                const beginTime = room.beginTime ? new Date(room.beginTime) : void 0;
                const endTime = room.endTime ? new Date(room.endTime) : void 0;

                const primaryAction = (
                    roomStatus?: RoomStatus,
                ): RoomListItemPrimaryAction<"replay" | "join" | "begin"> | null => {
                    let primaryAction: RoomListItemPrimaryAction<
                        "replay" | "join" | "begin"
                    > | null;
                    switch (roomStatus) {
                        case RoomStatus.Idle: {
                            const isCreator = room.ownerUUID === globalStore.userUUID;
                            primaryAction = isCreator
                                ? {
                                      key: "begin",
                                      text: t("begin"),
                                      type: "primary",
                                  }
                                : {
                                      key: "join",
                                      text: t("join"),
                                      type: "primary",
                                  };
                            break;
                        }
                        case RoomStatus.Started:
                        case RoomStatus.Paused: {
                            primaryAction = {
                                key: "join",
                                text: t("join"),
                                type: "primary",
                            };
                            break;
                        }
                        case RoomStatus.Stopped: {
                            primaryAction = room.hasRecord
                                ? {
                                      key: "replay",
                                      text: t("replay"),
                                  }
                                : null;
                            break;
                        }
                        default: {
                            primaryAction = {
                                key: "begin",
                                text: t("begin"),
                                type: "primary",
                            };
                            break;
                        }
                    }
                    return primaryAction;
                };

                return (
                    <Fragment key={room.roomUUID}>
                        <RoomListItem
                            beginTime={beginTime}
                            endTime={endTime}
                            isPeriodic={!!room.periodicUUID}
                            menuActions={getSubActions(room)}
                            ownerAvatar={room.ownerAvatarURL}
                            ownerName={room.ownerName}
                            primaryAction={primaryAction(room.roomStatus)}
                            status={getRoomStatus(room.roomStatus)}
                            title={room.title!}
                            onAction={key => {
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
                                    case "join":
                                    case "begin": {
                                        void joinRoom(room.roomUUID);
                                        break;
                                    }
                                    default:
                                }
                            }}
                        />
                    </Fragment>
                );
            })}
            <RoomListAllLoaded />
            {currentRoom && (
                <RemoveRoomModal
                    cancelModalVisible={cancelModalVisible}
                    isCreator={currentRoom.ownerUUID === globalStore.userUUID}
                    isPeriodicDetailsPage={false}
                    periodicUUID={currentRoom.periodicUUID}
                    roomUUID={currentRoom.roomUUID}
                    onCancel={hideCancelModal}
                    onCancelRoom={removeRoomHandler}
                />
            )}
            {currentRoom && (
                <InviteModal
                    baseUrl={FLAT_WEB_BASE_URL}
                    periodicWeeks={periodicInfo?.periodic.weeks}
                    room={currentRoom}
                    userName={globalStore.userName ?? ""}
                    visible={inviteModalVisible}
                    onCancel={hideInviteModal}
                    onCopy={onCopy}
                />
            )}
            {currentRoom && (
                <RemoveHistoryRoomModal
                    loading={removeHistoryLoading}
                    visible={removeHistoryVisible}
                    onCancel={hideRemoveHistoryModal}
                    onConfirm={removeConfirm}
                />
            )}
        </>
    );

    async function joinRoom(roomUUID: string): Promise<void> {
        if (globalStore.isTurnOffDeviceTest) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
        }
    }

    function replayRoom(config: { roomUUID: string; ownerUUID: string; roomType: RoomType }): void {
        const { roomUUID, ownerUUID, roomType } = config;
        window.open(`${FLAT_WEB_BASE_URL}/replay/${roomType}/${roomUUID}/${ownerUUID}/`, "_blank");
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

    async function onCopy(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
            void message.success(t("copy-success"));
        } catch {
            void message.error(t("copy-fail"));
        } finally {
            hideInviteModal();
        }
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
                result.push({ key: "invite", text: t("invitation") });
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
