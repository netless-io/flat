import { isSameDay } from "date-fns/fp";
import { observer } from "mobx-react-lite";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Skeleton } from "antd";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import emptyBoxSVG from "../../../assets/image/empty-box.svg";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { RoomItem } from "../../../stores/RoomStore";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { MainRoomListItem } from "./MainRoomListItem";
import { errorTips } from "../../../components/Tips/ErrorTips";
import { joinRoomHandler } from "../../utils/joinRoomHandler";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

export interface MainRoomListProps {
    listRoomsType: ListRoomsType;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({ listRoomsType }) {
    const roomStore = useContext(RoomStoreContext);
    const [roomUUIDs, setRoomUUIDs] = useState<string[]>();
    const pushHistory = usePushHistory();
    const sp = useSafePromise();
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
        refreshRooms();

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
                <img src={emptyBoxSVG} alt={"emptyBoxSVG"} />
                <span>{isHistoryList ? "暂无历史记录" : "暂无预约课程"}</span>
            </div>
        );
    }

    return (
        <>
            {customSort(roomUUIDs.map(roomUUID => roomStore.rooms.get(roomUUID))).map(
                (room, index, rooms) => {
                    if (!room) {
                        return null;
                    }

                    const lastRoom = index > 0 ? rooms[index - 1] : void 0;
                    const nextRoom = index < rooms.length - 1 ? rooms[index + 1] : void 0;

                    // show date title when two adjacent rooms are not the same day
                    const shouldShowDate = !(
                        room.beginTime &&
                        lastRoom?.beginTime &&
                        isSameDay(room.beginTime, lastRoom.beginTime)
                    );

                    // show divider when two adjacent rooms are not the same day
                    const shouldShowDivider = !(
                        room.beginTime &&
                        nextRoom?.beginTime &&
                        isSameDay(room.beginTime, nextRoom.beginTime)
                    );

                    return (
                        <MainRoomListItem
                            key={room.roomUUID}
                            showDate={shouldShowDate}
                            showDivider={shouldShowDivider}
                            room={room}
                            isHistoryList={isHistoryList}
                            onJoinRoom={roomUUID => joinRoomHandler(roomUUID, pushHistory)}
                            onReplayRoom={replayRoom}
                            onRemoveRoom={refreshRooms}
                        />
                    );
                },
            )}
        </>
    );

    function replayRoom(config: { roomUUID: string; ownerUUID: string; roomType: RoomType }): void {
        pushHistory(RouteNameType.ReplayPage, config);
    }

    function customSort(rooms: (RoomItem | undefined)[]): (RoomItem | undefined)[] {
        if (listRoomsType === ListRoomsType.History) {
            return rooms.sort((a, b) => (a && b ? Number(b.beginTime) - Number(a.beginTime) : 0));
        } else {
            return rooms;
        }
    }
});

export default MainRoomList;
