import "./index.less";

import React, { useState } from "react";
import { Button, Table } from "antd";
import { getDay } from "date-fns";
import { format, formatWithOptions } from "date-fns/fp";
import { zhCN } from "date-fns/locale";
import { RoomInfo, RoomStatus, RoomType, Week } from "../../types/room";
import { getRoomTypeName, getWeekName, getWeekNames } from "../../utils/room";
import { RoomStatusElement } from "../RoomStatusElement";
import { MoreMenu } from "./MoreMenu";
import { CancelPeriodicRoomModal } from "./CancelPeriodicRoomModal";
import { useTranslation } from "react-i18next";

export interface PeriodicRoomPanelProps {
    rooms: (RoomInfo | undefined)[];
    userName: string;
    isCreator: boolean;
    periodicInfo: {
        weeks: Week[];
        roomType: RoomType;
        endTime: number;
    };
    onCopyInvitation: (text: string) => void;
    onCancelPeriodicRoom: () => void;
    onCancelSubPeriodicRoom: (roomUUID: string, periodicUUID: string) => void;
    jumpToRoomDetailPage: (roomUUID: string, periodicUUID: string) => void;
    jumpToModifyOrdinaryRoomPage: (roomUUID: string, periodicUUID: string) => void;
    jumpToModifyPeriodicRoomPage: () => void;
}

export const PeriodicRoomPanel: React.FC<PeriodicRoomPanelProps> = ({
    rooms,
    userName,
    isCreator,
    periodicInfo,
    onCopyInvitation,
    onCancelPeriodicRoom,
    onCancelSubPeriodicRoom,
    jumpToRoomDetailPage,
    jumpToModifyPeriodicRoomPage,
    jumpToModifyOrdinaryRoomPage,
}) => {
    const { t } = useTranslation();
    const [cancelPeriodicRoomModalVisible, setCancelPeriodicRoomModalVisible] = useState(false);

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
                            align="left"
                            render={(_, room: RoomInfo) =>
                                dayFormat(room.beginTime || defaultDate) + "日"
                            }
                        />
                        <Table.Column
                            align="center"
                            render={(_, room: RoomInfo) =>
                                getWeekName(getDay(room.beginTime || defaultDate))
                            }
                        />
                        <Table.Column
                            align="center"
                            render={(_, room: RoomInfo) => {
                                return (
                                    timeSuffixFormat(room.beginTime || defaultDate) +
                                    "~" +
                                    timeSuffixFormat(room.endTime || defaultDate)
                                );
                            }}
                        />
                        <Table.Column
                            align="center"
                            render={(_, room: RoomInfo) => {
                                return <RoomStatusElement room={room} />;
                            }}
                        />
                        <Table.Column
                            align="right"
                            render={(_, room: RoomInfo) => {
                                return (
                                    <MoreMenu
                                        room={room}
                                        userName={userName}
                                        isCreator={isCreator}
                                        onCopyInvitation={onCopyInvitation}
                                        onCancelSubPeriodicRoom={() =>
                                            onCancelSubPeriodicRoom(
                                                room.roomUUID,
                                                room.periodicUUID!,
                                            )
                                        }
                                        jumpToRoomDetailPage={() =>
                                            jumpToRoomDetailPage(room.roomUUID, room.periodicUUID!)
                                        }
                                        jumpToModifyOrdinaryRoomPage={() =>
                                            jumpToModifyOrdinaryRoomPage(
                                                room.roomUUID,
                                                room.periodicUUID!,
                                            )
                                        }
                                    />
                                );
                            }}
                        />
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
                        结束于 {dayWeekFormat(periodicInfo.endTime)} ，共 {rooms.length} 个房间
                    </div>
                </div>
                <div className="periodic-room-panel-btn-list">
                    {isCreator ? (
                        <>
                            <Button disabled={hasRunning} onClick={jumpToModifyPeriodicRoomPage}>
                                {t("modify-periodic-rooms")}
                            </Button>
                            <Button
                                danger
                                onClick={() => setCancelPeriodicRoomModalVisible(true)}
                                disabled={hasRunning}
                            >
                                {t("cancel-of-periodic-rooms")}
                            </Button>
                        </>
                    ) : (
                        <Button danger onClick={() => setCancelPeriodicRoomModalVisible(true)}>
                            {t("remove-periodic-room")}
                        </Button>
                    )}
                </div>
                {renderPeriodicRoomTable()}
            </div>
            <CancelPeriodicRoomModal
                visible={cancelPeriodicRoomModalVisible}
                isCreator={isCreator}
                onCancelPeriodicRoom={onCancelPeriodicRoom}
                onCancel={() => setCancelPeriodicRoomModalVisible(false)}
            />
        </div>
    );
};
