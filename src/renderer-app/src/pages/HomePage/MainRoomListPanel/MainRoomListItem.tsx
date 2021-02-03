import { Button, Dropdown } from "antd";
import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";
import { RoomStatus, RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomListDate } from "../../../components/RoomListPanel/RoomListDate";
import { RoomListDuration } from "../../../components/RoomListPanel/RoomListDuration";
import { RoomItem } from "../../../stores/RoomStore";
import { MainRoomListItemMenus } from "./MainRoomListItemMenus";

export interface MainRoomListItemProps {
    showDate: boolean;
    room: RoomItem;
    isHistoryList: boolean;
    onJoinRoom: (roomUUID: string) => void;
    onReplayRoom: (config: { roomUUID: string; ownerUUID: string; roomType: RoomType }) => void;
}

export const MainRoomListItem = observer<MainRoomListItemProps>(function MainRoomListItem({
    showDate,
    room,
    isHistoryList,
    onJoinRoom,
    onReplayRoom,
}) {
    const roomStatusElement = useMemo((): React.ReactElement => {
        switch (room.roomStatus) {
            case RoomStatus.Started:
            case RoomStatus.Paused: {
                return <span className="room-started">进行中</span>;
            }
            case RoomStatus.Stopped: {
                return <span className="room-stopped">已结束</span>;
            }
            default: {
                return <span className="room-idle">未开始</span>;
            }
        }
    }, [room.roomStatus]);

    return (
        <div className="room-list-cell-item">
            {showDate && (
                <div className="room-list-cell-day">
                    <div className="room-list-cell-modify" />
                    <div className="room-list-cell-title">
                        <RoomListDate beginTime={room.beginTime} />
                    </div>
                </div>
            )}
            <div className="room-list-cell">
                <div className="room-list-cell-left">
                    <div className="room-list-cell-name">{room.title}</div>
                    <div className="room-list-cell-state">
                        {isHistoryList ? (
                            <span className="room-stopped">已结束</span>
                        ) : (
                            <>
                                {roomStatusElement}
                                {room.periodicUUID && (
                                    <span className="room-list-cell-periodic">周期</span>
                                )}
                            </>
                        )}
                    </div>
                    <div className="room-list-cell-time">
                        <RoomListDuration beginTime={room.beginTime} endTime={room.endTime} />
                    </div>
                </div>
                <div className="room-list-cell-right">
                    <Dropdown
                        overlay={
                            <MainRoomListItemMenus
                                roomUUID={room.roomUUID}
                                periodicUUID={room.periodicUUID}
                                isHistoryList={isHistoryList}
                                ownerUUID={room.ownerUUID}
                            />
                        }
                        trigger={["click"]}
                    >
                        <Button className="room-list-cell-more">更多</Button>
                    </Dropdown>
                    {isHistoryList ? (
                        room.hasRecord ? (
                            <Button
                                className="room-list-cell-enter"
                                type="primary"
                                onClick={() =>
                                    onReplayRoom({
                                        roomUUID: room.roomUUID,
                                        ownerUUID: room.ownerUUID,
                                        roomType: room.roomType || RoomType.OneToOne,
                                    })
                                }
                            >
                                查看回放
                            </Button>
                        ) : (
                            <Button disabled className="room-list-cell-enter" type="primary">
                                查看回放
                            </Button>
                        )
                    ) : (
                        <Button
                            className="room-list-cell-enter"
                            type="primary"
                            onClick={() => onJoinRoom(room.roomUUID)}
                        >
                            进入房间
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});
