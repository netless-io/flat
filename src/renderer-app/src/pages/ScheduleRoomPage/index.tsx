import { Button, Divider, Dropdown, Menu, Modal, Table } from "antd";
import { getDay } from "date-fns";
import { format, formatWithOptions } from "date-fns/fp";
import { zhCN } from "date-fns/locale";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { useLastLocation } from "react-router-last-location";
import back from "../../assets/image/back.svg";
import moreBtn from "../../assets/image/moreBtn.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { CopyInvitationItem } from "../../components/MoreMenu/CopyInvitationItem";
import { ModifyRoomItem } from "../../components/MoreMenu/ModifyRoomItem";
import { RemoveRoomItem } from "../../components/MoreMenu/RemoveRoomItem";
import { RoomDetailsItem } from "../../components/MoreMenu/RoomDetailsItem";
import { RoomStatusElement } from "../../components/RoomStatusElement/RoomStatusElement";
import { RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { globalStore } from "../../stores/GlobalStore";
import { RoomItem } from "../../stores/RoomStore";
import { getWeekName } from "../../utils/getTypeName";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import "./ScheduleRoomPage.less";

const yearMonthFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM");
const dayFormat = formatWithOptions({ locale: zhCN }, "dd");
const timeSuffixFormat = format("HH:mm");
const dayWeekFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM/dd iii");

export const ScheduleRoomDetailPage = observer<{}>(function ScheduleRoomDetailPage() {
    const params = useParams<RouteParams<RouteNameType.ScheduleRoomDetailPage>>();
    const roomStore = useContext(RoomStoreContext);
    const [cancelRoomUUIDList, setCancelRoomUUIDList] = useState<Array<string>>([]);
    const [cancelModalVisible, showCancelModal] = useState(false);
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
        pushHistory(RouteNameType.HomePage);
    };

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
                        rowKey="roomUUID"
                        showHeader={false}
                        bordered={false}
                        pagination={false}
                    >
                        <Table.Column
                            render={(_, room: RoomItem) =>
                                dayFormat(room.beginTime || defaultDate) + "日"
                            }
                        />
                        <Table.Column
                            render={(_, room: RoomItem) =>
                                getWeekName(getDay(room.beginTime || defaultDate))
                            }
                        />
                        <Table.Column
                            render={(_, room: RoomItem) => {
                                return (
                                    timeSuffixFormat(room.beginTime || defaultDate) +
                                    "~" +
                                    timeSuffixFormat(room.endTime || defaultDate)
                                );
                            }}
                        />
                        <Table.Column
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
                            <Button
                                danger
                                onClick={() => showCancelModal(true)}
                                disabled={!isCreator}
                            >
                                取消周期性房间
                            </Button>
                        </div>
                        <div className="schedule-room-list">
                            <div className="schedule-room-list-month">{renderRoomTable()}</div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                visible={cancelModalVisible}
                title="取消房间"
                onCancel={() => showCancelModal(false)}
                onOk={cancelRoom}
                footer={[
                    <Button key="Cancel" onClick={() => showCancelModal(false)}>
                        再想想
                    </Button>,
                    <Button key="Ok" type="primary" onClick={cancelRoom}>
                        确定
                    </Button>,
                ]}
            >
                确定取消该系列全部周期性房间？
            </Modal>
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
                        {isCreator && (
                            <RemoveRoomItem
                                room={room}
                                isCreator={isCreator}
                                onRemoveRoom={removeHandle}
                                disableCancelAll
                            />
                        )}
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
