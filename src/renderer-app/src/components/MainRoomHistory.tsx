import React from "react"
import "./MainRoomHistory.less"
export type MainRoomListProps = {

}

export class MainRoomHistory extends React.Component<MainRoomListProps> {
    public render() {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">历史记录</span>
                    </div>
                </div>
                <div className="room-list-line"/>
            </div>
        )
    }
}
