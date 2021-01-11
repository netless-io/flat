import React from "react";
import "./MainRoomHistory.less";
import empty_box from "../assets/image/empty-box.svg";
export type MainRoomListProps = {};

export class MainRoomHistory extends React.Component<MainRoomListProps> {
    public render() {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">历史记录</span>
                    </div>
                </div>
                <div className="room-list-line" />
                <div className="room-list-body">
                    <div className="room-empty-box">
                        <img src={empty_box} alt={"empty_box"} />
                        <span>暂无历史记录</span>
                    </div>
                </div>
            </div>
        );
    }
}
