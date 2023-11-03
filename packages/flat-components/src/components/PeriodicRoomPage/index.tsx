import "./index.less";

import React, { useMemo, useState } from "react";
import { Button, Table } from "antd";
import { getDay } from "date-fns";
import { format, formatWithOptions } from "date-fns/fp";
import { zhCN, enUS } from "date-fns/locale";
import { RoomInfo, RoomStatus, RoomType, Week } from "../../types/room";
import { getWeekName, getWeekNames } from "../../utils/room";
import { RoomStatusElement } from "../RoomStatusElement";
import { MoreMenu } from "./MoreMenu";
import { CancelPeriodicRoomModal } from "./CancelPeriodicRoomModal";
import { useLanguage, useTranslate } from "@netless/flat-i18n";

export interface PeriodicRoomPanelProps {
    pmi?: string | null;
    rooms: Array<RoomInfo | undefined>;
    userName: string;
    isCreator: boolean;
    inviteBaseUrl: string;
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
    pmi,
    rooms,
    userName,
    inviteBaseUrl,
    isCreator,
    periodicInfo,
    onCopyInvitation,
    onCancelPeriodicRoom,
    onCancelSubPeriodicRoom,
    jumpToRoomDetailPage,
    jumpToModifyPeriodicRoomPage,
    jumpToModifyOrdinaryRoomPage,
}) => {
    const t = useTranslate();
    const language = useLanguage();
    const [cancelPeriodicRoomModalVisible, setCancelPeriodicRoomModalVisible] = useState(false);

    const locale = useMemo(() => (language.startsWith("zh") ? zhCN : enUS), [language]);
    const yearMonthFormat = formatWithOptions({ locale }, "yyyy/MM");
    const dayFormat = formatWithOptions({ locale }, "dd");
    const timeSuffixFormat = format("HH:mm");
    const dayWeekFormat = formatWithOptions({ locale }, "yyyy/MM/dd (iii)");

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
                        bordered={false}
                        dataSource={polymerizationRooms[key]}
                        pagination={false}
                        rowKey="roomUUID"
                        showHeader={false}
                    >
                        <Table.Column
                            align="left"
                            render={(_, room: RoomInfo) =>
                                // TODO: i18n
                                dayFormat(room.beginTime || defaultDate) + "日"
                            }
                        />
                        <Table.Column
                            align="center"
                            render={(_, room: RoomInfo) =>
                                getWeekName(getDay(room.beginTime || defaultDate), language)
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
                                        inviteBaseUrl={inviteBaseUrl}
                                        isCreator={isCreator}
                                        isPmi={room.inviteCode === pmi}
                                        jumpToModifyOrdinaryRoomPage={() =>
                                            jumpToModifyOrdinaryRoomPage(
                                                room.roomUUID,
                                                room.periodicUUID!,
                                            )
                                        }
                                        jumpToRoomDetailPage={() =>
                                            jumpToRoomDetailPage(room.roomUUID, room.periodicUUID!)
                                        }
                                        room={room}
                                        userName={userName}
                                        onCancelSubPeriodicRoom={() =>
                                            onCancelSubPeriodicRoom(
                                                room.roomUUID,
                                                room.periodicUUID!,
                                            )
                                        }
                                        onCopyInvitation={onCopyInvitation}
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
        <>
            <div className="periodic-room-panel-container">
                <div className="periodic-room-panel-tips">
                    <div>
                        {t("time")}

                        <span>
                            {t("repeat-frequency", {
                                week: getWeekNames(periodicInfo.weeks, language),
                            })}
                        </span>
                    </div>
                    <div>
                        {t("type")}

                        <span>{t(`class-room-type.${periodicInfo.roomType}`)}</span>
                    </div>
                    <div>
                        {t("periodic")}

                        <span>
                            {t("schedule-room-detail", {
                                time: dayWeekFormat(periodicInfo.endTime),
                                length: rooms.length,
                            })}
                        </span>
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
                                disabled={hasRunning}
                                onClick={() => setCancelPeriodicRoomModalVisible(true)}
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
                isCreator={isCreator}
                visible={cancelPeriodicRoomModalVisible}
                onCancel={() => setCancelPeriodicRoomModalVisible(false)}
                onCancelPeriodicRoom={onCancelPeriodicRoom}
            />
        </>
    );
};
