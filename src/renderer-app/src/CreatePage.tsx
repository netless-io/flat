import * as React from "react";
import { RouteComponentProps } from "react-router";
import logo from "./assets/image/logo.svg";
import { Button, Input } from "antd";
import { Link } from "react-router-dom";
import { Identity } from "./IndexPage";
import { LocalStorageRoomDataType } from "./HistoryPage";
import moment from "moment";
import { netlessWhiteboardApi } from "./apiMiddleware";
import { ipcAsyncByMain } from './utils/Ipc';

export type JoinPageStates = {
    roomName: string;
    value: boolean;
};

export default class CreatePage extends React.Component<RouteComponentProps, JoinPageStates> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            roomName: "",
            value: false,
        };
        ipcAsyncByMain("set-win-size", {
            width: 480,
            height: 480,
        });
    }

    private createRoomAndGetUuid = async (room: string, limit: number): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.createRoomApi(room, limit);
        if (res.uuid) {
            return res.uuid;
        } else {
            return null;
        }
    };

    private handleJoin = async (): Promise<void> => {
        const userId = `${Math.floor(Math.random() * 100000)}`;
        const uuid = await this.createRoomAndGetUuid(this.state.roomName, 0);
        if (uuid) {
            this.setRoomList(uuid, this.state.roomName, userId);
            this.props.history.push(`/whiteboard/${Identity.creator}/${uuid}/${userId}/`);
        }
    };
    public setRoomList = (uuid: string, roomName: string, userId: string): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            roomName: roomName,
                            userId: userId,
                        },
                        ...roomArray,
                    ]),
                );
            } else {
                const newRoomArray = roomArray.filter(data => data.uuid !== uuid);
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            roomName: roomName,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ]),
                );
            }
        } else {
            localStorage.setItem(
                "rooms",
                JSON.stringify([
                    {
                        uuid: uuid,
                        time: timestamp,
                        identity: Identity.creator,
                        roomName: roomName,
                        userId: userId,
                    },
                ]),
            );
        }
    };

    public render(): React.ReactNode {
        const { roomName } = this.state;
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        <span>0.0.1</span>
                    </div>
                    <div className="page-index-form-box">
                        <Input
                            placeholder={"输入房间名"}
                            value={roomName}
                            style={{ marginBottom: 28, width: 384 }}
                            onChange={evt => this.setState({ roomName: evt.target.value })}
                            size={"large"}
                        />
                        <div className="page-index-btn-box">
                            <Link to={"/"}>
                                <Button className="page-index-btn" size={"large"}>
                                    返回首页
                                </Button>
                            </Link>
                            <Button
                                className="page-index-btn"
                                disabled={roomName === ""}
                                size={"large"}
                                onClick={this.handleJoin}
                                type={"primary"}
                            >
                                创建房间
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
