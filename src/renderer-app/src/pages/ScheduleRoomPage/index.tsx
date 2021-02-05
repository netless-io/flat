import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import MainPageLayout from "../../components/MainPageLayout";
import back from "../../assets/image/back.svg";
import moreBtn from "../../assets/image/moreBtn.svg";
import "./ScheduleRoomPage.less";
import { Button, Divider, Dropdown, Menu, message, Table } from "antd";
import { format, formatWithOptions, getDay } from "date-fns/fp";
import { zhCN } from "date-fns/locale";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { observer } from "mobx-react-lite";
import { RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { RoomItem } from "../../stores/RoomStore";
import { RoomStatusElement } from "../../components/RoomStatusElement/RoomStatusElement";
import { getWeekName } from "../../utils/getTypeName";
import { InviteModal } from "../RoomDetailPage/InviteModal";
import { clipboard } from "electron";
import { globalStore } from "../../stores/GlobalStore";

const yearMonthFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM");
const dayFormat = formatWithOptions({ locale: zhCN }, "dd");
const timeSuffixFormat = format("HH:mm");
const dayWeekFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM/dd iii");

export const ScheduleRoomDetailPage = observer<{}>(function ScheduleRoomDetailPage() {
    const params = useParams<RouteParams<RouteNameType.ScheduleRoomDetailPage>>();
    const roomStore = useContext(RoomStoreContext);
    const history = useHistory();
    const pushHistory = usePushHistory();

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
                                        roomDetailsLink={() => {
                                            pushHistory(RouteNameType.RoomDetailPage, {
                                                roomUUID: room.roomUUID,
                                                periodicUUID,
                                            });
                                        }}
                                        isCreator={isCreator}
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
                        <div className="schedule-room-back" onClick={() => history.goBack()}>
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
                            <Button disabled={!isCreator}>修改周期性房间</Button>
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
    roomDetailsLink: () => void;
    isCreator: boolean;
}

const MoreMenu = observer<MoreMenuProps>(function MoreMenu({ room, roomDetailsLink, isCreator }) {
    const [isShowInviteModal, setIsShowInviteModal] = useState(false);

    return (
        <Dropdown
            overlay={() => {
                return (
                    <Menu>
                        <Menu.Item onClick={roomDetailsLink}>房间详情</Menu.Item>
                        {isCreator && (
                            <>
                                <Menu.Item>修改房间</Menu.Item>
                                <Menu.Item>取消房间</Menu.Item>
                            </>
                        )}
                        <Menu.Item
                            onClick={() => {
                                setIsShowInviteModal(true);
                            }}
                        >
                            复制邀请
                        </Menu.Item>
                        <InviteModal
                            room={room}
                            onCopy={() => {
                                clipboard.writeText(room.roomUUID);
                                message.success("复制成功");
                            }}
                            onCancel={() => setIsShowInviteModal(false)}
                            visible={isShowInviteModal}
                        />
                    </Menu>
                );
            }}
            trigger={["click"]}
        >
            <img src={moreBtn} alt="更多" />
        </Dropdown>
    );
});
