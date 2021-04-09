import { Button, Dropdown } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomListDate } from "../../../components/RoomListPanel/RoomListDate";
import { RoomListDuration } from "../../../components/RoomListPanel/RoomListDuration";
import { RoomStatusElement } from "../../../components/RoomStatusElement/RoomStatusElement";
import { RoomItem } from "../../../stores/RoomStore";
import { MainRoomListItemMenus } from "./MainRoomListItemMenus";

export interface MainRoomListItemProps {
    showDate: boolean;
    showDivider: boolean;
    room: RoomItem;
    isHistoryList: boolean;
    onJoinRoom: (roomUUID: string) => void;
    onReplayRoom: (config: { roomUUID: string; ownerUUID: string; roomType: RoomType }) => void;
    onRemoveRoom: (roomUUID?: string) => void;
}

export const MainRoomListItem = observer<MainRoomListItemProps>(function MainRoomListItem({
    showDate,
    showDivider,
    room,
    isHistoryList,
    onJoinRoom,
    onReplayRoom,
    onRemoveRoom,
}) {
    void showDivider;
    return (
        <div className="room-list-cell-item">
            {showDate && (
                <div className="room-list-cell-day">
                    <div className="room-list-cell-title">
                        <RoomListDate beginTime={room.beginTime} />
                    </div>
                </div>
            )}
            <div className="room-list-cell">
                <div className="room-list-cell-left">
                    <div className="room-list-cell-name">{room.title}</div>
                    <div className="room-list-cell-time">
                        <RoomListDuration beginTime={room.beginTime} endTime={room.endTime} />
                    </div>
                    <div className="room-list-cell-state">
                        {<RoomStatusElement room={room} />}
                        {room.periodicUUID && <span className="room-list-cell-periodic">周期</span>}
                    </div>
                </div>
                <div className="room-list-cell-right" onClick={e => e.stopPropagation()}>
                    <Dropdown
                        overlay={
                            <MainRoomListItemMenus
                                className="room-list-cell-more-menu"
                                roomUUID={room.roomUUID}
                                periodicUUID={room.periodicUUID}
                                isHistoryList={isHistoryList}
                                ownerUUID={room.ownerUUID}
                                onRemoveRoom={onRemoveRoom}
                            />
                        }
                        trigger={["click"]}
                    >
                        <Button className="room-list-cell-more">...</Button>
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
                                回放
                            </Button>
                        ) : (
                            <Button disabled className="room-list-cell-enter" type="primary">
                                回放
                            </Button>
                        )
                    ) : (
                        <Button
                            className="room-list-cell-enter"
                            type="primary"
                            onClick={() => onJoinRoom(room.roomUUID)}
                        >
                            进入
                        </Button>
                    )}
                </div>
            </div>
            <div className="room-list-cell-divider" />
        </div>
    );
});
