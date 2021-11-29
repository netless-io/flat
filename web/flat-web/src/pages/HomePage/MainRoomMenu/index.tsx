import "./MainRoomMenu.less";

import React, { FC, useContext } from "react";
import { Region } from "flat-components";
import { RoomType } from "../../../api-middleware/flatServer/constants";
import { GlobalStoreContext, RoomStoreContext } from "../../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { errorTips } from "../../../components/Tips/ErrorTips";

export const MainRoomMenu: FC = () => {
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const pushHistory = usePushHistory();

    const onJoinRoom = async (roomUUID: string): Promise<void> => {
        if (globalStore.isTurnOffDeviceTest) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
        }
    };

    return (
        <div className="main-room-menu-container">
            <JoinRoomBox onJoinRoom={onJoinRoom} />
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
            });
            await onJoinRoom(roomUUID);
        } catch (e) {
            errorTips(e);
        }
    }
};

export default MainRoomMenu;
