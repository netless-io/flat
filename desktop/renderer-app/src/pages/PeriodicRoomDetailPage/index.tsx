import "./index.less";

import { clipboard } from "electron";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { useLastLocation } from "react-router-last-location";
import { LoadingPage, MainPageHeader, PeriodicRoomPanel } from "flat-components";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { RoomStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { globalStore } from "../../stores/global-store";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { cancelPeriodicRoom, cancelPeriodicSubRoom } from "../../api-middleware/flatServer";
import { FLAT_WEB_BASE_URL } from "../../constants/process";

/**
 * TODO: we forget set i18n in current file!!!
 */

export const PeriodicRoomDetailPage = observer<{}>(function PeriodicRoomDetailPage() {
    useWindowSize("Main");

    const params = useParams<RouteParams<RouteNameType.PeriodicRoomDetailPage>>();
    const roomStore = useContext(RoomStoreContext);
    const [cancelRoomUUIDList, setCancelRoomUUIDList] = useState<string[]>([]);
    const history = useHistory();
    const pushHistory = usePushHistory();
    const previousPage = useLastLocation();

    const { periodicUUID } = params;

    const periodicInfo = roomStore.periodicRooms.get(periodicUUID);
    const rooms = periodicInfo?.rooms
        .filter(roomUUID => !cancelRoomUUIDList.includes(roomUUID))
        .map(roomUUID => roomStore.rooms.get(roomUUID));

    useEffect(() => {
        roomStore.syncPeriodicRoomInfo(periodicUUID).catch(errorTips);
    }, [periodicUUID, roomStore]);

    if (!periodicInfo || !rooms) {
        return <LoadingPage timeMS={3 * 1000} />;
    }

    const { title, ownerUUID, ownerUserName } = periodicInfo.periodic;

    const isCreator = globalStore.userUUID === ownerUUID;

    // if the room has been cancelled and return to the previous page, an error will be reported
    const backPreviousPage = (): void => {
        if (!previousPage?.pathname) {
            return pushHistory(RouteNameType.HomePage);
        }

        const previousRouterContainRemoveRoomUUID = cancelRoomUUIDList.some(roomUUID => {
            return previousPage.pathname.includes(roomUUID);
        });

        if (previousRouterContainRemoveRoomUUID) {
            return pushHistory(RouteNameType.HomePage);
        }

        history.goBack();
    };

    const onCancelSubPeriodicRoom = async (
        roomUUID: string,
        periodicUUID: string,
    ): Promise<void> => {
        if (roomUUID) {
            try {
                await cancelPeriodicSubRoom({ roomUUID, periodicUUID });

                const nextList = [...cancelRoomUUIDList, roomUUID];
                const nextRooms = rooms.filter(room => {
                    return room && !nextList.includes(room.roomUUID);
                });

                void message.success("已取消该房间");

                if (nextRooms.length === 0) {
                    pushHistory(RouteNameType.HomePage);
                } else {
                    setCancelRoomUUIDList(nextList);
                }
            } catch (err) {
                console.log(err);
                errorTips(err);
            }
        }
    };

    async function onCancelPeriodicRoom(): Promise<void> {
        try {
            if (periodicInfo) {
                await cancelPeriodicRoom(periodicUUID);
            }
        } catch (err) {
            errorTips(err);
        }

        pushHistory(RouteNameType.HomePage);
        await message.success("已取消该房间");
    }

    function jumpToRoomDetailPage(roomUUID: string, periodicUUID: string): void {
        pushHistory(RouteNameType.RoomDetailPage, {
            periodicUUID,
            roomUUID,
        });
    }

    function jumpToModifyOrdinaryRoomPage(roomUUID: string, periodicUUID: string): void {
        pushHistory(RouteNameType.ModifyOrdinaryRoomPage, {
            periodicUUID,
            roomUUID,
        });
    }

    function jumpToModifyPeriodicRoomPage(): void {
        if (periodicInfo) {
            pushHistory(RouteNameType.ModifyPeriodicRoomPage, {
                periodicUUID,
            });
        }
    }

    return (
        <MainPageLayoutContainer>
            <div className="periodic-room-detail-page-container">
                <div className="periodic-room-detail-page-header-container">
                    <MainPageHeader
                        title={
                            <>
                                <h1 className="periodic-room-detail-page-header-title">{title}</h1>
                            </>
                        }
                        onBackPreviousPage={backPreviousPage}
                    />
                </div>
                <div className="periodic-room-detail-page-panel-container fancy-scrollbar">
                    <PeriodicRoomPanel
                        inviteBaseUrl={FLAT_WEB_BASE_URL}
                        rooms={rooms}
                        userName={ownerUserName}
                        isCreator={isCreator}
                        periodicInfo={periodicInfo.periodic}
                        onCopyInvitation={text => clipboard.writeText(text)}
                        onCancelPeriodicRoom={onCancelPeriodicRoom}
                        onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
                        jumpToRoomDetailPage={jumpToRoomDetailPage}
                        jumpToModifyOrdinaryRoomPage={jumpToModifyOrdinaryRoomPage}
                        jumpToModifyPeriodicRoomPage={jumpToModifyPeriodicRoomPage}
                    />
                </div>
            </div>
        </MainPageLayoutContainer>
    );
});
