import "./index.less";

import React, { useState } from "react";
import { Button, Table } from "antd";
import { getDay } from "date-fns";
import { format, formatWithOptions } from "date-fns/fp";
import { zhCN } from "date-fns/locale";
import { RoomInfo, RoomStatus, RoomType, Week } from "../../types/room";
import { getRoomTypeName, getWeekName, getWeekNames } from "../../utils/room";
import { RoomStatusElement } from "../RoomStatusElement";
import { RemoveRoomModal } from "../RemoveRoomModal";

export interface PeriodicRoomPanelProps {
    rooms: RoomInfo[];
    isCreator: boolean;
    periodicInfo: {
        weeks: Week[];
        roomType: RoomType;
        endTime: Date;
        roomCount: number;
    };
    jumpToPeriodicModifyPage: () => void;
    onCancelRoom: () => void;
}

export const PeriodicRoomPanel: React.FC<PeriodicRoomPanelProps> = ({
    rooms,
    periodicInfo,
    isCreator,
    jumpToPeriodicModifyPage,
    onCancelRoom,
}) => {
    const [cancelModalVisible, showCancelModal] = useState(false);

    const yearMonthFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM");
    const dayFormat = formatWithOptions({ locale: zhCN }, "dd");
    const timeSuffixFormat = format("HH:mm");
    const dayWeekFormat = formatWithOptions({ locale: zhCN }, "yyyy/MM/dd iii");

    const hasRunning = rooms.some(room =>
        [RoomStatus.Started, RoomStatus.Paused].includes(room?.roomStatus as RoomStatus),
    );

    const defaultDate = new Date();

    const renderPeriodicRoomTable = (): React.ReactNode => {
        const polymerizationRooms = (() => {
            const result: Record<string, RoomInfo[]> = {};

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
                    <div className="periodic-room-panel-month-value">{key}</div>
                    <div className="periodic-room-panel-table-line" />
                    <Table
                        rowKey="roomUUID"
                        dataSource={polymerizationRooms[key]}
                        showHeader={false}
                        bordered={false}
                        pagination={false}
                    >
                        <Table.Column
                            render={(_, room: RoomInfo) =>
                                dayFormat(room.beginTime || defaultDate) + "日"
                            }
                        />
                        <Table.Column
                            render={(_, room: RoomInfo) =>
                                getWeekName(getDay(room.beginTime || defaultDate))
                            }
                        />
                        <Table.Column
                            render={(_, room: RoomInfo) => {
                                return (
                                    timeSuffixFormat(room.beginTime || defaultDate) +
                                    "~" +
                                    timeSuffixFormat(room.endTime || defaultDate)
                                );
                            }}
                        />
                        <Table.Column
                            render={(_, room: RoomInfo) => {
                                return <RoomStatusElement room={room} />;
                            }}
                        />
                        {/* 
                        // TODO: MoreMenu component
                        <Table.Column
                        render={(_, room: RoomInfo) => {
                            return null;
                        }}
                    /> */}
                    </Table>
                </div>
            ));
        return <div className="periodic-room-panel-table-container">{groupedList}</div>;
    };

    return (
        <div className="periodic-room-panel-container">
            <div className="periodic-room-panel-body">
                <div className="periodic-room-panel-tips">
                    <div className="periodic-room-panel-tips-title">
                        每{getWeekNames(periodicInfo.weeks)}
                    </div>
                    <div className="periodic-room-panel-tips-type">
                        房间类型：{getRoomTypeName(periodicInfo.roomType)}
                    </div>
                    <div className="periodic-room-panel-tips-inner">
                        结束于 {dayWeekFormat(periodicInfo.endTime)} ，共 {periodicInfo.roomCount}{" "}
                        个房间
                    </div>
                </div>
                <div className="periodic-room-panel-btn-list">
                    {isCreator ? (
                        <>
                            <Button disabled={hasRunning} onClick={jumpToPeriodicModifyPage}>
                                修改周期性房间
                            </Button>
                            <Button
                                danger
                                onClick={() => showCancelModal(true)}
                                disabled={hasRunning}
                            >
                                取消周期性房间
                            </Button>
                        </>
                    ) : (
                        <Button danger onClick={() => showCancelModal(true)}>
                            移除周期性房间
                        </Button>
                    )}
                </div>
                {renderPeriodicRoomTable()}
            </div>
            <RemoveRoomModal
                cancelModalVisible={cancelModalVisible}
                isCreator={isCreator}
                onCancel={() => showCancelModal(false)}
                onCancelRoom={onCancelRoom}
                isPeriodicDetailsPage={true}
            />
        </div>
    );
};
