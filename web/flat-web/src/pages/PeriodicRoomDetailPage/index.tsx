import "./style.less";

import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { useLastLocation } from "react-router-last-location";
import { LoadingPage, PeriodicRoomPanel } from "flat-components";
import { PageStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { globalStore } from "../../stores/GlobalStore";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { cancelPeriodicRoom, cancelPeriodicSubRoom } from "../../api-middleware/flatServer";
import { FLAT_WEB_BASE_URL } from "../../constants/process";
import { useTranslation } from "react-i18next";

export const PeriodicRoomDetailPage = observer<{}>(function PeriodicRoomDetailPage() {
    const { t } = useTranslation();

    const params = useParams<RouteParams<RouteNameType.PeriodicRoomDetailPage>>();
    const roomStore = useContext(RoomStoreContext);
    const [cancelRoomUUIDList, setCancelRoomUUIDList] = useState<string[]>([]);
    const history = useHistory();
    const pushHistory = usePushHistory();
    const previousPage = useLastLocation();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        // if the room has been cancelled and return to the previous page, an error will be reported
        function backPreviousPage(): void {
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
        }

        const title = periodicInfo?.periodic.title;

        pageStore.configure({
            title: <h1 className="periodic-room-detail-page-header-title">{title}</h1>,
            onBackPreviousPage: backPreviousPage,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const { ownerUUID, ownerName } = periodicInfo.periodic;

    const isCreator = globalStore.userUUID === ownerUUID;

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

                void message.success(t("the-room-has-been-cancelled"));

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
        await message.success(t("the-room-has-been-cancelled"));
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
        <div className="periodic-room-detail-page-container">
            <PeriodicRoomPanel
                inviteBaseUrl={FLAT_WEB_BASE_URL}
                isCreator={isCreator}
                jumpToModifyOrdinaryRoomPage={jumpToModifyOrdinaryRoomPage}
                jumpToModifyPeriodicRoomPage={jumpToModifyPeriodicRoomPage}
                jumpToRoomDetailPage={jumpToRoomDetailPage}
                periodicInfo={periodicInfo.periodic}
                rooms={rooms}
                userName={ownerName}
                onCancelPeriodicRoom={onCancelPeriodicRoom}
                onCancelSubPeriodicRoom={onCancelSubPeriodicRoom}
                onCopyInvitation={text => navigator.clipboard.writeText(text)}
            />
        </div>
    );
});

export default PeriodicRoomDetailPage;
