import "./MainRoomMenu.less";

import React, { FC, useContext } from "react";
import { Col, Row } from "antd";
import { Region } from "flat-components";
import { RoomType } from "@netless/flat-server-api";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { errorTips } from "flat-components";

export const MainRoomMenu: FC = () => {
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const pushHistory = usePushHistory();

    const onJoinRoom = async (roomUUID: string): Promise<void> => {
        if (globalStore.isTurnOffDeviceTest || window.isElectron) {
            await joinRoomHandler(roomUUID, pushHistory);
        } else {
            pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
        }
    };

    return (
        <div className="main-room-menu-container">
            <Row gutter={16}>
                <Col span={6}>
                    <JoinRoomBox onJoinRoom={onJoinRoom} />
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
        pmi?: boolean,
    ): Promise<void> {
        try {
            const roomUUID = await roomStore.createOrdinaryRoom({
                title,
                type,
                beginTime: Date.now(),
                region,
                pmi: !!pmi,
            });

            await onJoinRoom(roomUUID);
        } catch (e) {
            errorTips(e);
        }
    }
};

export default MainRoomMenu;
