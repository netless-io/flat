import "./MainRoomMenu.less";

import React, { FC, useContext } from "react";
import { Region } from "flat-components";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { usePushHistory } from "../../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { joinRoomHandler } from "../../utils/joinRoomHandler";
import { errorTips } from "../../../components/Tips/ErrorTips";

export const MainRoomMenu: FC = () => {
    const roomStore = useContext(RoomStoreContext);
    const pushHistory = usePushHistory();

    return (
        <div className="main-room-menu-container">
            <JoinRoomBox onJoinRoom={roomUUID => joinRoomHandler(roomUUID, pushHistory)} />
            <CreateRoomBox onCreateRoom={createOrdinaryRoom} />
            <ScheduleRoomBox />
        </div>
    );

    async function createOrdinaryRoom(
        title: string,
        type: RoomType,
        region: Region,
    ): Promise<void> {
        try {
            const roomUUID = await roomStore.createOrdinaryRoom({
                title,
                type,
                beginTime: Date.now(),
                region,
                // TODO docs:[]
            });
            await joinRoomHandler(roomUUID, pushHistory);
        } catch (e) {
            errorTips(e);
        }
    }
};

export default MainRoomMenu;
