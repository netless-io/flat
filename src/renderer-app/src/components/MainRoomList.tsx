import React, {ReactNode} from "react"
import "./MainRoomList.less"
export type MainRoomListProps = {

}

export class MainRoomList extends React.PureComponent<MainRoomListProps> {

    private renderRoomList = (): ReactNode => {
        return (
            <div>
            </div>
        );
    }
    public render() {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">房间列表</span>
                    </div>
                    <div>
                        <span className="room-list-tab">
                            全部
                        </span>
                        <span className="room-list-tab">
                            今天
                        </span>
                        <span className="room-list-tab">
                            周期
                        </span>
                    </div>
                </div>
                <div className="room-list-line"/>
                <div className="room-list-body">
                    {this.renderRoomList()}
                </div>
            </div>
        )
    }
}
