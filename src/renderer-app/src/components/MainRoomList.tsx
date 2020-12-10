import React from "react"

export type MainRoomListProps = {

}

export class MainRoomList extends React.PureComponent<MainRoomListProps> {
    public render() {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <span>房间列表</span>
                    <span>全部今天周期</span>
                </div>
            </div>
        )
    }
}