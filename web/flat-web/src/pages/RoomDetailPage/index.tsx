// import docsIconSVG from "../../assets/image/docs-icon.svg";
import "./style.less";

import React, { useContext, useEffect } from "react";
import { LoadingPage, RoomDetailPanel } from "flat-components";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import {
    GlobalStoreContext,
    PageStoreContext,
    RoomStoreContext,
} from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { RoomStatus } from "../../api-middleware/flatServer/constants";
import { message } from "antd";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { useTranslation } from "react-i18next";

export const RoomDetailPage = observer(function RoomDetailPage() {
    const { t } = useTranslation();

    const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
    const pushHistory = usePushHistory();
    const history = useHistory();
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);
    const pageStore = useContext(PageStoreContext);
    const roomInfo = roomStore.rooms.get(roomUUID);
    const periodicInfo = periodicUUID ? roomStore.periodicRooms.get(periodicUUID) : undefined;

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicSubRoomInfo({ roomUUID, periodicUUID }).catch(errorTips);
        } else {
            roomStore.syncOrdinaryRoomInfo(roomUUID).catch(errorTips);
        }
    }, [roomStore, roomUUID, periodicUUID]);

    useEffect(() => {
        if (roomInfo) {
            pageStore.configure({
                title: <h1 className="room-detail-page-header-title">{roomInfo.title}</h1>,
                onBackPreviousPage: () => history.goBack(),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomInfo?.title]);

    if (!roomInfo) {
        // it is not a good idea to let the loading take too long on the current page
        // 3 seconds is just right
        return <LoadingPage timeMS={3 * 1000} />;
    }

    const isCreator = roomInfo.ownerUUID === globalStore.userUUID;

    async function joinRoom(): Promise<void> {
        if (roomInfo) {
            const roomUUID = roomInfo.roomUUID;
            if (globalStore.isTurnOffDeviceTest) {
                await joinRoomHandler(roomUUID, pushHistory);
            } else {
                pushHistory(RouteNameType.DevicesTestPage, { roomUUID });
            }
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
            const { roomType, roomUUID, ownerUUID } = roomInfo;
            window.open(
                `${FLAT_WEB_BASE_URL}/replay/${roomType}/${roomUUID}/${ownerUUID}/`,
                "_blank",
            );
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
        <div className="room-detail-page-container">
            <div className="room-detail-page-panel-container">
                <RoomDetailPanel
                    inviteBaseUrl={FLAT_WEB_BASE_URL}
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
    );
});

export default RoomDetailPage;
