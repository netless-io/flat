import "./MainRoomMenu.less";

import React, { FC, useContext } from "react";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";

export interface MainRoomMenuProps {}

export const MainRoomMenu: FC = () => {
    const roomStore = useContext(RoomStoreContext);
    const pushHistory = usePushHistory();

    return (
        <div className="main-room-menu-container">
            <JoinRoomBox onJoinRoom={joinRoom} />
            <CreateRoomBox onCreateRoom={createOrdinaryRoom} />
            <ScheduleRoomBox />
        </div>
    );

    async function createOrdinaryRoom(title: string, type: RoomType): Promise<void> {
        const roomUUID = await roomStore.createOrdinaryRoom({
            title,
            type,
            beginTime: Date.now(),
            // TODO docs:[]
        });
        await joinRoom(roomUUID);
    }

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
};

export default MainRoomMenu;
