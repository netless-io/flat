import "./MainRoomMenu.less";

import React, { FC, useContext } from "react";
import { Col, Row } from "antd";
import { Region } from "flat-components";
import { RoomType } from "../../../api-middleware/flatServer/constants";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { usePushHistory } from "../../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { errorTips } from "../../../components/Tips/ErrorTips";

export const MainRoomMenu: FC = () => {
    const roomStore = useContext(RoomStoreContext);
    const pushHistory = usePushHistory();

    return (
        <div className="main-room-menu-container">
            <Row gutter={16}>
                <Col span={6}>
                    <JoinRoomBox onJoinRoom={roomUUID => joinRoomHandler(roomUUID, pushHistory)} />
                </Col>
                <Col span={6}>
                    <CreateRoomBox onCreateRoom={createOrdinaryRoom} />
                </Col>
                <Col span={6}>
                    <ScheduleRoomBox />
                </Col>
            </Row>
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
            await joinRoomHandler(roomUUID, pushHistory);
        } catch (e) {
            errorTips(e);
        }
    }
};

export default MainRoomMenu;
