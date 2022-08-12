import "./index.less";

import React, { useContext, useEffect } from "react";
import { LoadingPage, MainPageHeader, RoomDetailPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import { message } from "antd";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { useTranslate } from "@netless/flat-i18n";

export const RoomDetailPage = observer<{}>(function RoomDetailPage() {
    useWindowSize("Main");

    const t = useTranslate();
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
        // it is not a good idea to let the loading take too long on the current page
        // 3 seconds is just right
        return <LoadingPage timeMS={3 * 1000} />;
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

        void message.success(t("the-room-has-been-cancelled"));

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
        }
    }

    return (
        <MainPageLayoutContainer>
            <div className="room-detail-page-container">
                <div className="room-detail-page-header">
                    <MainPageHeader
                        title={
                            <>
                                <h1 className="room-detail-page-header-title">{roomInfo.title}</h1>
                                {periodicUUID && (
                                    <>
                                        {roomInfo.roomStatus !== RoomStatus.Stopped && (
                                            <div
                                                className="room-detail-page-header-right"
                                                onClick={jumpToPeriodicRoomDetailPage}
                                            >
                                                {t("view-all-rooms-in-periodic-rooms", {
                                                    count: roomInfo.count || 0,
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        }
                        onBackPreviousPage={() => history.goBack()}
                    />
                </div>
                <div className="room-detail-page-content">
                    <RoomDetailPanel
                        inviteBaseUrl={FLAT_WEB_BASE_URL}
                        isCreator={isCreator}
                        isPeriodicDetailsPage={false}
                        periodicWeeks={periodicInfo?.periodic.weeks}
                        room={roomInfo}
                        roomInfo={roomInfo}
                        userName={roomInfo.ownerName || ""}
                        onCancelRoom={onCancelRoom}
                        onCopyInvitation={text => navigator.clipboard.writeText(text)}
                        onJoinRoom={joinRoom}
                        onModifyRoom={jumpToModifyRoom}
                        onReplayRoom={jumpToReplayPage}
                    />
                </div>
            </div>
        </MainPageLayoutContainer>
    );
});

export default RoomDetailPage;
