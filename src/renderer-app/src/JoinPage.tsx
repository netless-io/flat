import * as React from "react";
import { RouteComponentProps } from "react-router";
import "./JoinPage.less";
import logo from "./assets/image/logo.svg";
import { Button, Input, Select, Radio } from "antd";
import { Link } from "react-router-dom";
import { Identity } from "./IndexPage";
import moment from "moment";
import { LocalStorageRoomDataType } from "./HistoryPage";
import { ipcAsyncByMain } from './utils/Ipc';

export type JoinPageStates = {
    roomId: string;
    name: string;
    radioValue: number;
};

export default class JoinPage extends React.Component<RouteComponentProps<{}>, JoinPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            roomId: "",
            name: name ? name : "",
            radioValue: 1
        };
        ipcAsyncByMain("set-win-size", {
            width: 480,
            height: 480,
        });
    }

    private handleJoin = (): void => {
        const userId = `${Math.floor(Math.random() * 100000)}`;
        if (this.state.name !== localStorage.getItem("userName")) {
            localStorage.setItem("userName", this.state.name);
        }
        this.setRoomList(this.state.roomId, userId);
        this.props.history.push(`/whiteboard/${Identity.joiner}/${this.state.roomId}/${userId}/`);
    };

    public setRoomList = (uuid: string, userId: string): void => {
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
                            identity: Identity.joiner,
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
                        userId: userId,
                    },
                ]),
            );
        }
    };
    public render(): React.ReactNode {
        const { roomId, name, radioValue } = this.state;
        return (
            <div className="page-index-box">
                <div className="page-join-mid-box">
                    <div className="page-index-form-box">
                        <span>房间号</span>
                        <Select
                            placeholder={"请输入房间号"}
                            // value={roomId}
                            // onChange={evt => this.setState({ name: evt.target.value })}
                            style={{ width: 312, marginBottom: 28, marginTop: 6 }}
                            size={"large"}
                        />
                        <span>昵称</span>
                        <Input
                            placeholder={"请输入昵称"}
                            // value={name}
                            onChange={evt => this.setState({ roomId: evt.target.value })}
                            style={{ width: 312, marginBottom: 28, marginTop: 6 }}
                            size={"large"}
                        />
                        <div className="page-join-radio-box">
                            <span>加入选项</span>
                            <Radio.Group value={radioValue}                            >
                                <Radio style={{ display: "block", marginTop: 16, color: "#444E60"}} value={1}>开启麦克风</Radio>
                                <Radio style={{ marginTop: 16, color: "#444E60" }} value={2}>开启摄像头</Radio>
                            </Radio.Group>
                        </div>
                        <div className="page-join-btn-box">
                            <Button
                                onClick={this.handleJoin}
                                style={{ marginTop: 48, height: 40 }}
                                disabled={roomId === "" || name === ""}
                            >
                                加入房间
                            </Button>
                            <Button style={{ marginTop: 16, height: 40 }}>
                                <Link to={"/"}>取消</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
