import * as React from "react";
import { RouteComponentProps } from "react-router";
import "./HistoryPage.less";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { Identity } from "./IndexPage";
import { LeftOutlined } from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";
import board from "./assets/image/board.svg";
import { ipcAsyncByMain } from "./utils/Ipc";

export type JoinPageStates = {
    rooms: LocalStorageRoomDataType[];
};

export type LocalStorageRoomDataType = {
    uuid: string;
    time: string;
    identity: Identity;
    userId: string;
    roomName?: string;
    cover?: string;
    recordings?: Array<{
        uuid: string;
        startTime: number;
        endTime: number;
        videoUrl?: string;
    }>;
    isRoomOwner?: boolean;
};

export default class JoinPage extends React.Component<RouteComponentProps<{}>, JoinPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const rooms = localStorage.getItem("rooms");
        this.state = {
            rooms: JSON.parse(rooms!),
        };

        ipcAsyncByMain("set-win-size", {
            width: 480,
            height: 480,
        });
    }

    private handleJoin = (room: LocalStorageRoomDataType): void => {
        this.props.history.push(`/whiteboard/${room.identity}/${room.uuid}/${room.userId}/`);
    };

    private handleReplay = (room: LocalStorageRoomDataType): void => {
        this.props.history.push(`/replay/${room.identity}/${room.uuid}/${room.userId}/`);
    };

    private renderCells = (): React.ReactNode => {
        const { rooms } = this.state;
        if (rooms.length > 0) {
            return rooms.map(room => {
                return (
                    <div key={room.uuid}>
                        <div className="room-cell-box">
                            <div className="room-cell-left">
                                <div className="room-cell-image">
                                    <img src={room.cover ? room.cover : board} alt={"cover"} />
                                </div>
                                <div>
                                    <div className="room-cell-text">
                                        {room.roomName ? room.roomName : room.uuid}
                                    </div>
                                    <div className="room-cell-time">{room.time}</div>
                                </div>
                            </div>
                            <div className="room-cell-right">
                                <Button
                                    onClick={() => this.handleJoin(room)}
                                    type={"primary"}
                                    style={{ width: 96 }}
                                >
                                    进入房间
                                </Button>
                                <Button
                                    onClick={() => this.handleReplay(room)}
                                    style={{ width: 96 }}
                                >
                                    查看回放
                                </Button>
                            </div>
                        </div>
                        <div className="room-cell-cut-line" />
                    </div>
                );
            });
        } else {
            return null;
        }
    };

    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-history-head">
                        <Link to={"/"}>
                            <div className="page-history-back">
                                <LeftOutlined /> <div>返回</div>
                            </div>
                        </Link>
                        <Button
                            type="link"
                            size={"small"}
                            style={{ marginRight: 20, fontSize: 14 }}
                            onClick={() => {
                                localStorage.removeItem("rooms");
                                this.setState({ rooms: [] });
                            }}
                        >
                            清空
                        </Button>
                    </div>
                    {this.state.rooms.length === 0 ? (
                        <div className="page-history-body-empty">
                            <img src={empty_box} alt={"empty_box"} />
                        </div>
                    ) : (
                        <div className="page-history-body">{this.renderCells()}</div>
                    )}
                </div>
            </div>
        );
    }
}
