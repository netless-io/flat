/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable react-hooks/exhaustive-deps */
import "./MainRoomMenu.less";

import React, { FC, useContext, useMemo } from "react";
import { Col, Row } from "antd";
import { Region } from "flat-components";
import { AILanguage, AIRole, AIScene, RoomType } from "@netless/flat-server-api";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { CreateRoomBox } from "./CreateRoomBox";
import { JoinRoomBox } from "./JoinRoomBox";
import { ScheduleRoomBox } from "./ScheduleRoomBox";
import { joinRoomHandler } from "../../utils/join-room-handler";
import { errorTips } from "flat-components";
import CreateAIRoomBox from "./CreateAIRoomBox";
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

    const AIRoomBox = useMemo(() => {
        const isCnWeb = window.location.host.includes(".apprtc.cn");
        if (!isCnWeb) {
            return <CreateAIRoomBox onCreateRoom={createAIRoom} />;
        }
        return null;
    }, [window.location.host]);

    return (
        <div className="main-room-menu-container">
            <Row gutter={24}>
                <Col span={6}>
                    <JoinRoomBox onJoinRoom={onJoinRoom} />
                </Col>
                <Col span={6}>
                    <CreateRoomBox onCreateRoom={createOrdinaryRoom} />
                </Col>
                <Col span={6}>
                    <ScheduleRoomBox />
                </Col>
                <Col span={6}>{AIRoomBox}</Col>
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
    async function createAIRoom(
        title: string,
        type: RoomType,
        region: Region,
        role: AIRole,
        scene: AIScene,
        language: AILanguage,
    ): Promise<void> {
        try {
            const roomUUID = await roomStore.createAIRoom({
                title,
                type,
                beginTime: Date.now(),
                region,
                pmi: false,
                isAI: true,
                role,
                scene,
                language,
            });

            await onJoinRoom(roomUUID);
        } catch (e) {
            errorTips(e);
        }
    }
};

export default MainRoomMenu;
