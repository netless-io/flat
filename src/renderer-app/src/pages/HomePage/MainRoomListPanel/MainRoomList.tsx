import { isSameDay } from "date-fns/fp";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useState } from "react";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import emptyBoxSVG from "../../../assets/image/empty-box.svg";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { RoomItem } from "../../../stores/RoomStore";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { MainRoomListItem } from "./MainRoomListItem";

export interface MainRoomListProps {
    listRoomsType: ListRoomsType;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({ listRoomsType }) {
    const [refreshRooms, forceRefreshRooms] = useState(0);
    const roomStore = useContext(RoomStoreContext);
    const [roomUUIDs, setRoomUUIDs] = useState<string[]>([]);
    const pushHistory = usePushHistory();
    const isHistoryList = listRoomsType === ListRoomsType.History;

    useEffect(() => {
        let isUnMount = false;

        function refreshRooms(): void {
            roomStore
                .listRooms(listRoomsType, { page: 1 })
                .then(roomUUIDs => {
                    if (!isUnMount) {
                        setRoomUUIDs(roomUUIDs);
                    }
                })
                .catch(console.warn);
        }

        refreshRooms();

        const ticket = window.setInterval(refreshRooms, 30 * 1000);

        return () => {
            isUnMount = true;
            window.clearInterval(ticket);
        };
    }, [refreshRooms, listRoomsType, roomStore]);

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
                            onJoinRoom={joinRoom}
                            onReplayRoom={replayRoom}
                            onRemoveRoom={() => forceRefreshRooms(e => ~e)}
                        />
                    );
                },
            )}
        </>
    );

    async function joinRoom(roomUUID: string): Promise<void> {
        const data = await roomStore.joinRoom(roomUUID);
        // @TODO make roomType a param
        switch (data.roomType) {
            case RoomType.BigClass: {
                pushHistory(RouteNameType.BigClassPage, data);
                break;
            }
            case RoomType.SmallClass: {
                pushHistory(RouteNameType.SmallClassPage, data);
                break;
            }
            case RoomType.OneToOne: {
                pushHistory(RouteNameType.OneToOnePage, data);
                break;
            }
            default: {
                console.error(new Error("failed to join room: incorrect room type"));
            }
        }
    }

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
