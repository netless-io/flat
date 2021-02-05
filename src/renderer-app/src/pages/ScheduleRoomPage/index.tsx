import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import MainPageLayout from "../../components/MainPageLayout";
import back from "../../assets/image/back.svg";
import moreBtn from "../../assets/image/moreBtn.svg";
import "./ScheduleRoomPage.less";
import { format, formatWithOptions } from "date-fns/fp";
import { Button, Divider, Dropdown, Menu, Table } from "antd";
import { zhCN } from "date-fns/locale";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { observer } from "mobx-react-lite";
import { RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { RoomItem } from "../../stores/RoomStore";
import { RoomStatusElement } from "../../components/RoomStatusElement/RoomStatusElement";
import { getWeekName } from "../../utils/getTypeName";
import { globalStore } from "../../stores/GlobalStore";
import { RoomDetailsItem } from "../../components/MoreMenu/RoomDetailsItem";
import { ModifyRoomItem } from "../../components/MoreMenu/ModifyRoomItem";
import { RemoveRoomItem } from "../../components/MoreMenu/RemoveRoomItem";
import { CopyInvitationItem } from "../../components/MoreMenu/CopyInvitationItem";
import { getDay } from "date-fns";
import { useLastLocation } from "react-router-last-location";

const yearMonthFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM");
const dayFormat = formatWithOptions({ locale: zhCN }, "dd");
const timeSuffixFormat = format("HH:mm");
const dayWeekFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM/dd iii");

export const ScheduleRoomDetailPage = observer<{}>(function ScheduleRoomDetailPage() {
    const params = useParams<RouteParams<RouteNameType.ScheduleRoomDetailPage>>();
    const roomStore = useContext(RoomStoreContext);
    const [cancelRoomUUIDList, setCancelRoomUUIDList] = useState<Array<string>>([]);
    const history = useHistory();
    const pushHistory = usePushHistory();
    const previousPage = useLastLocation();

    const { periodicUUID } = params;

    const periodicInfo = roomStore.periodicRooms.get(periodicUUID);
    const rooms = periodicInfo?.rooms.map(roomUUID => roomStore.rooms.get(roomUUID));

    useEffect(() => {
        void roomStore.syncPeriodicRoomInfo(periodicUUID);
    }, [periodicUUID, roomStore]);

    if (!periodicInfo || !rooms) {
        return <LoadingPage />;
    }

    const isCreator = globalStore.userUUID === periodicInfo.periodic.ownerUUID;

    const cancelRoom = async (): Promise<void> => {
        await roomStore.cancelRoom({
            all: true,
            periodicUUID,
        });
        history.block();
    };

    // if the room has been cancelled and return to the previous page, an error will be reported
    const backPreviousPage = (): void => {
        if (!previousPage?.pathname) {
            return pushHistory(RouteNameType.HomePage, {});
        }

        const previousRouterContainRemoveRoomUUID = cancelRoomUUIDList.some(roomUUID => {
            return previousPage.pathname.includes(roomUUID);
        });

        if (previousRouterContainRemoveRoomUUID) {
            return pushHistory(RouteNameType.HomePage, {});
        }

        history.goBack();
    };

    const addRemoveRoomUUID = (roomUUID: string | undefined): void => {
        if (roomUUID) {
            setCancelRoomUUIDList([...cancelRoomUUIDList, roomUUID]);
        }
    };

    const renderRoomTable = (): React.ReactNode => {
        const defaultDate = new Date();

        const polymerizationRooms = (() => {
            const result: Record<string, RoomItem[]> = {};

            rooms.forEach(room => {
                if (room?.beginTime) {
                    const key = result[yearMonthFormat(room.beginTime)];

                    if (key) {
                        key.push(room);
                    } else {
                        result[yearMonthFormat(room.beginTime)] = [room];
                    }
                }
            });

            return result;
        })();

        const groupedList = Object.keys(polymerizationRooms)
            .sort()
            .map(key => (
                <div key={key}>
                    <div className="month-value">{key}</div>
                    <div className="table-line" />
                    <Table
                        dataSource={polymerizationRooms[key]}
                        showHeader={false}
                        bordered={false}
                        pagination={false}
                    >
                        <Table.Column
                            key={1}
                            render={(_, room: RoomItem) =>
                                dayFormat(room.beginTime || defaultDate) + "日"
                            }
                        />
                        <Table.Column
                            key={2}
                            render={(_, room: RoomItem) =>
                                getWeekName(getDay(room.beginTime || defaultDate))
                            }
                        />
                        <Table.Column
                            key={3}
                            render={(_, room: RoomItem) => {
                                return (
                                    timeSuffixFormat(room.beginTime || defaultDate) +
                                    "~" +
                                    timeSuffixFormat(room.endTime || defaultDate)
                                );
                            }}
                        />
                        <Table.Column
                            key={4}
                            render={(_, room: RoomItem) => {
                                return <RoomStatusElement room={room} />;
                            }}
                        />
                        <Table.Column
                            render={(_, room: RoomItem) => {
                                return (
                                    <MoreMenu
                                        room={room}
                                        isCreator={isCreator}
                                        removeHandle={addRemoveRoomUUID}
                                    />
                                );
                            }}
                        />
                    </Table>
                </div>
            ));

        return <div className="table-container">{groupedList}</div>;
    };

    return (
        <MainPageLayout>
            <div className="schedule-room-box">
                <div className="schedule-room-nav">
                    <div className="schedule-room-head">
                        <div className="schedule-room-back" onClick={() => backPreviousPage()}>
                            <img src={back} alt="back" />
                            <span>返回</span>
                        </div>
                        <Divider type="vertical" />
                        <div className="schedule-room-title">{periodicInfo.periodic.title}</div>
                    </div>
                    <div className="schedule-room-cut-line" />
                </div>
                <div className="schedule-room-body">
                    <div className="schedule-room-mid">
                        <div className="schedule-room-tips">
                            <div className="schedule-room-tips-title">每周六</div>
                            <div className="schedule-room-tips-type">
                                房间类型： {periodicInfo.periodic.roomType}
                            </div>
                            <div className="schedule-room-tips-inner">
                                结束于 {dayWeekFormat(periodicInfo.periodic.endTime)} ，共
                                {rooms.length}个房间
                            </div>
                        </div>
                        <div className="schedule-btn-list">
                            <Button
                                disabled={!isCreator}
                                onClick={() =>
                                    pushHistory(RouteNameType.ModifyPeriodicRoomPage, {
                                        periodicUUID,
                                    })
                                }
                            >
                                修改周期性房间
                            </Button>
                            <Button danger onClick={cancelRoom} disabled={!isCreator}>
                                取消周期性房间
                            </Button>
                        </div>
                        <div className="schedule-room-list">
                            <div className="schedule-room-list-month">{renderRoomTable()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );
});

interface MoreMenuProps {
    room: RoomItem;
    isCreator: boolean;
    removeHandle: (roomUUID: string | undefined) => void;
}

const MoreMenu = observer<MoreMenuProps>(function MoreMenu({ room, isCreator, removeHandle }) {
    return (
        <Dropdown
            overlay={() => {
                return (
                    <Menu>
                        <RoomDetailsItem room={room} />
                        <ModifyRoomItem room={room} isCreator={isCreator} />
                        <RemoveRoomItem
                            room={room}
                            isCreator={isCreator}
                            handleClick={removeHandle}
                        />
                        <CopyInvitationItem room={room} />
                    </Menu>
                );
            }}
            trigger={["click"]}
        >
            <img src={moreBtn} alt="更多" />
        </Dropdown>
    );
});
