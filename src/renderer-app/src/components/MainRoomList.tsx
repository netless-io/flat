import React, {Component, PureComponent, ReactNode} from "react"
import "./MainRoomList.less"
import {Button} from "antd";
export type MainRoomListStates = {
    activeRoomList: RoomListSort,
}

enum RoomListSort {
    all = "all",
    today = "today",
    cycle = "cycle",
}

export class MainRoomList extends PureComponent<{}, MainRoomListStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            activeRoomList: RoomListSort.all,
        };
    }
    private renderRoomList = (): ReactNode => {
        const {activeRoomList} = this.state;
        switch (activeRoomList) {
            case RoomListSort.all: {
                return (
                    <div>
                    </div>
                );
            }
            case RoomListSort.today: {
                return (
                    <div>
                    </div>
                );
            }
            default: {
                return (
                    <div>
                    </div>
                );
            }
        }
    }

    private handleRoomListSort = async (activeRoomList: RoomListSort): Promise<void> => {
        this.setState({activeRoomList: activeRoomList});
    }

    public render() {
        const {activeRoomList} = this.state;
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">房间列表</span>
                    </div>
                    <div>
                        <span style={{color: activeRoomList === RoomListSort.all ? "#3381FF" : "#7A7B7C"}}
                              onClick={() => this.handleRoomListSort(RoomListSort.all)}
                              className="room-list-tab">
                            全部
                        </span>
                        <span style={{color: activeRoomList === RoomListSort.today ? "#3381FF" : "#7A7B7C"}}
                              onClick={() => this.handleRoomListSort(RoomListSort.today)}
                              className="room-list-tab">
                            今天
                        </span>
                        <span style={{color: activeRoomList === RoomListSort.cycle ? "#3381FF" : "#7A7B7C"}}
                              onClick={() => this.handleRoomListSort(RoomListSort.cycle)}
                              className="room-list-tab">
                            周期
                        </span>
                    </div>
                </div>
                <div className="room-list-line"/>
                <div className="room-list-body">
                    <div className="room-list-cell-day">
                        <div className="room-list-cell-modify"/>
                        <div className="room-list-cell-title">
                            11 月 26 日 今天
                        </div>
                    </div>
                    <div className="room-list-cell">
                        <div className="room-list-cell-left">
                            <div className="room-list-cell-name">
                                伍双发起的会议
                            </div>
                            <div className="room-list-cell-state">
                                进行中
                            </div>
                            <div className="room-list-cell-time">
                                12:30 ~ 13: 30
                            </div>
                        </div>
                        <div className="room-list-cell-right">
                            <Button className="room-list-cell-more">更多</Button>
                            <Button className="room-list-cell-enter" type="primary">进入房间</Button>
                        </div>
                    </div>
                    <div className="room-list-cell-day">
                        <div className="room-list-cell-modify"/>
                        <div className="room-list-cell-title">
                            11 月 26 日 今天
                        </div>
                    </div>
                    <div className="room-list-cell">
                        <div className="room-list-cell-left">
                            <div className="room-list-cell-name">
                                伍双发起的会议
                            </div>
                            <div className="room-list-cell-state">
                                进行中
                            </div>
                            <div className="room-list-cell-time">
                                12:30 ~ 13: 30
                            </div>
                        </div>
                        <div className="room-list-cell-right">
                            <Button className="room-list-cell-more">更多</Button>
                            <Button className="room-list-cell-enter" type="primary">进入房间</Button>
                        </div>
                    </div>
                    <div className="room-list-cell">
                        <div className="room-list-cell-left">
                            <div className="room-list-cell-name">
                                伍双发起的会议
                            </div>
                            <div className="room-list-cell-state">
                                进行中
                            </div>
                            <div className="room-list-cell-time">
                                12:30 ~ 13: 30
                            </div>
                        </div>
                        <div className="room-list-cell-right">
                            <Button className="room-list-cell-more">更多</Button>
                            <Button className="room-list-cell-enter" type="primary">进入房间</Button>
                        </div>
                    </div>
                    <div className="room-list-cell-day">
                        <div className="room-list-cell-modify"/>
                        <div className="room-list-cell-title">
                            11 月 26 日 今天
                        </div>
                    </div>
                    <div className="room-list-cell">
                        <div className="room-list-cell-left">
                            <div className="room-list-cell-name">
                                伍双发起的会议
                            </div>
                            <div className="room-list-cell-state">
                                进行中
                            </div>
                            <div className="room-list-cell-time">
                                12:30 ~ 13: 30
                            </div>
                        </div>
                        <div className="room-list-cell-right">
                            <Button className="room-list-cell-more">更多</Button>
                            <Button className="room-list-cell-enter" type="primary">进入房间</Button>
                        </div>
                    </div>
                    <div style={{height: 16}}/>
                </div>
            </div>
        )
    }
}
