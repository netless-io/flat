import emptyBoxSVG from "../../../assets/image/empty-box.svg";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { isSameDay } from "date-fns/fp";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";
import { MainRoomListItem } from "./MainRoomListItem";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";

export interface MainRoomListProps {
    listRoomsType: ListRoomsType;
}

export const MainRoomList = observer<MainRoomListProps>(function MainRoomList({ listRoomsType }) {
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
    }, [listRoomsType, roomStore]);

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
            {roomUUIDs
                .map(roomUUID => roomStore.rooms.get(roomUUID))
                .map((room, index, rooms) => {
                    if (!room) {
                        return null;
                    }

                    const lastRoom = index > 0 ? rooms[index - 1] : void 0;

                    // show date title when two adjacent rooms are not the same day
                    const shouldShowDate = !(
                        room.beginTime &&
                        lastRoom?.beginTime &&
                        isSameDay(room.beginTime, lastRoom.beginTime)
                    );

                    return (
                        <MainRoomListItem
                            key={room.roomUUID}
                            showDate={shouldShowDate}
                            room={room}
                            isHistoryList={isHistoryList}
                            onJoinRoom={joinRoom}
                            onReplayRoom={replayRoom}
                        />
                    );
                })}
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
});

export default MainRoomList;
