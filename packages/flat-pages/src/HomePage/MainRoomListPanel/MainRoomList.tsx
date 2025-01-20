import { message } from "antd";
import React, { Fragment, useContext, useEffect, useState } from "react";
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
    StopClassConfirmModal,
    errorTips,
} from "flat-components";
import { ListRoomsType, RoomStatus, RoomType, stopClass } from "@netless/flat-server-api";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { RoomItem, RoomStore } from "@netless/flat-stores";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { useTranslate } from "@netless/flat-i18n";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { generateAvatar } from "../../utils/generate-avatar";

export interface MainRoomListProps {
    roomStore: RoomStore;
    listRoomsType: ListRoomsType;
    refreshRooms: () => Promise<void>;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({
    roomStore,
    listRoomsType,
    refreshRooms,
}) {
    const t = useTranslate();
    const [skeletonsVisible, setSkeletonsVisible] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
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

    const roomUUIDs = roomStore.roomUUIDs[listRoomsType];

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
                    if (roomStatus === RoomStatus.Stopped) {
                        return room.hasRecord
                            ? {
                                  key: "replay",
                                  text: t("replay"),
                              }
                            : null;
                    } else {
                        return {
                            key: "join",
                            text: t("join"),
                            type: "primary",
                        };
                    }
                };

                return (
                    <Fragment key={room.roomUUID}>
                        <RoomListItem
                            beginTime={beginTime}
                            endTime={endTime}
                            generateAvatar={generateAvatar}
                            inviteCode={room.inviteCode}
                            isPeriodic={!!room.periodicUUID}
                            isPmi={room.inviteCode === globalStore.pmi}
                            joinEarly={globalStore.serverRegionConfig?.server.joinEarly}
                            menuActions={getSubActions(room)}
                            ownerAvatar={room.ownerAvatarURL}
                            ownerName={room.ownerName}
                            ownerUUID={room.ownerUUID}
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
                                    case "stop": {
                                        setCurrentRoom(room);
                                        setStopModalVisible(true);
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
                                    case "share": {
                                        shareRecording({
                                            ownerUUID: room.ownerUUID,
                                            roomUUID: room.roomUUID,
                                            roomType: room.roomType || RoomType.OneToOne,
                                        });
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
                <StopClassConfirmModal
                    loading={false}
                    visible={stopModalVisible}
                    onCancel={hideStopModal}
                    onStop={stopRoomHandler}
                />
            )}
            {currentRoom && (
                <InviteModal
                    baseUrl={FLAT_WEB_BASE_URL}
                    isPmi={currentRoom.inviteCode === globalStore.pmi}
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
        if (globalStore.isTurnOffDeviceTest || window.isElectron) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
        }
    }

    function replayRoom(config: { roomUUID: string; ownerUUID: string; roomType: RoomType }): void {
        const { roomUUID, ownerUUID, roomType } = config;
        if (window.isElectron) {
            pushHistory(RouteNameType.ReplayPage, { roomType, roomUUID, ownerUUID });
        } else {
            window.open(`/replay/${roomType}/${roomUUID}/${ownerUUID}/`, "_blank");
        }
    }

    function hideCancelModal(): void {
        setCancelModalVisible(false);
    }

    function hideStopModal(): void {
        setStopModalVisible(false);
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

    async function shareRecording(config: {
        roomUUID: string;
        ownerUUID: string;
        roomType: RoomType;
    }): Promise<void> {
        const { roomType, roomUUID, ownerUUID } = config;
        const url = `${FLAT_WEB_BASE_URL}/replay/${roomType}/${roomUUID}/${ownerUUID}`;
        try {
            await navigator.clipboard.writeText(url);
            void message.success(t("copy-success"));
        } catch {
            void message.error(t("copy-fail"));
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

    async function stopRoomHandler(): Promise<void> {
        const { ownerUUID, roomUUID, roomStatus } = currentRoom!;
        const isCreator = ownerUUID === globalStore.userUUID;
        const isStarted = roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused;
        try {
            if (isCreator && isStarted) {
                await stopClass(roomUUID);
                globalStore.updatePmiRoomListByRoomUUID(roomUUID);
                void refreshRooms();
            }
            setStopModalVisible(false);
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
        | Array<{ key: "details" | "share" | "delete-history"; text: string }>
        | Array<{ key: "details" | "modify" | "cancel" | "stop" | "invite"; text: string }>;

    function getSubActions(room: RoomItem): SubActions {
        const result = [{ key: "details", text: t("room-detail") }];
        if (isHistoryList) {
            if (room.roomUUID) {
                if (room.hasRecord) {
                    result.push({ key: "share", text: t("share-record") });
                }
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
            } else if (isCreator) {
                result.push({
                    key: "stop",
                    text: t("end-the-class"),
                });
            }
            if (room.roomUUID && !room.isAI) {
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
