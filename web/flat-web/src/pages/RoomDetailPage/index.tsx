// import docsIconSVG from "../../assets/image/docs-icon.svg";
import "./style.less";

import React, { useContext, useEffect } from "react";
import { LoadingPage, RoomDetailPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/joinRoomHandler";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { message } from "antd";
import { MainPageLayoutHorizontalContainer } from "../../components/MainPageLayoutHorizontalContainer";

export const RoomDetailPage = observer(function RoomDetailPage() {
    const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
    const pushHistory = usePushHistory();
    const history = useHistory();
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);
    const roomInfo = roomStore.rooms.get(roomUUID);
    const periodicInfo = periodicUUID ? roomStore.periodicRooms.get(periodicUUID) : undefined;

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicSubRoomInfo({ roomUUID, periodicUUID }).catch(errorTips);
        } else {
            roomStore.syncOrdinaryRoomInfo(roomUUID).catch(errorTips);
        }
    }, [roomStore, roomUUID, periodicUUID]);

    if (!roomInfo) {
        return <LoadingPage />;
    }

    const isCreator = roomInfo.ownerUUID === globalStore.userUUID;

    async function joinRoom(): Promise<void> {
        if (roomInfo) {
            await joinRoomHandler(roomInfo.roomUUID, pushHistory);
        }
    }

    async function onCancelRoom(all: boolean): Promise<void> {
        try {
            if (!isCreator && periodicUUID) {
                await roomStore.cancelRoom({
                    all: true,
                    periodicUUID,
                });
            } else {
                await roomStore.cancelRoom({
                    all,
                    roomUUID,
                    periodicUUID,
                });
            }
        } catch (err) {
            console.log(err);
            errorTips(err);
        }

        void message.success("已取消该房间");

        history.goBack();
    }

    function jumpToPeriodicRoomDetailPage(): void {
        if (roomInfo?.periodicUUID) {
            pushHistory(RouteNameType.PeriodicRoomDetailPage, {
                periodicUUID: roomInfo.periodicUUID,
            });
        }
    }

    function jumpToReplayPage(): void {
        if (roomInfo) {
            pushHistory(RouteNameType.ReplayPage, {
                roomUUID: roomInfo.roomUUID,
                ownerUUID: roomInfo.ownerUUID,
                roomType: roomInfo.roomType!,
            });
        }
    }

    function jumpToModifyRoom(): void {
        if (roomInfo) {
            if (roomInfo.roomUUID) {
                pushHistory(RouteNameType.ModifyOrdinaryRoomPage, {
                    roomUUID: roomInfo.roomUUID,
                    periodicUUID: roomInfo.periodicUUID,
                });
            }
            if (roomInfo.periodicUUID) {
                pushHistory(RouteNameType.ModifyPeriodicRoomPage, {
                    periodicUUID: roomInfo.periodicUUID,
                });
            }
        }
    }

    return (
        <MainPageLayoutHorizontalContainer
            title={<h1 className="room-detail-page-header-title">{roomInfo.title}</h1>}
            onBackPreviousPage={() => history.goBack()}
        >
            <div className="room-detail-page-container">
                <div className="room-detail-page-panel-container">
                    <RoomDetailPanel
                        showRoomCountVisible={
                            periodicUUID ? roomInfo.roomStatus !== RoomStatus.Stopped : false
                        }
                        jumpToPeriodicRoomDetailPage={jumpToPeriodicRoomDetailPage}
                        roomInfo={roomInfo}
                        room={roomInfo}
                        userName={roomInfo.ownerUserName || ""}
                        isCreator={isCreator}
                        isPeriodicDetailsPage={false}
                        periodicWeeks={periodicInfo?.periodic.weeks}
                        onJoinRoom={joinRoom}
                        onModifyRoom={jumpToModifyRoom}
                        onReplayRoom={jumpToReplayPage}
                        onCancelRoom={onCancelRoom}
                        onCopyInvitation={text => navigator.clipboard.writeText(text)}
                    />
                </div>
            </div>
        </MainPageLayoutHorizontalContainer>
    );
});

export default RoomDetailPage;
