import React from "react";
import { RouteComponentProps } from "react-router";
import { Button, Input, Select, Radio } from "antd";
import { Link } from "react-router-dom";
import { ipcAsyncByMain } from "./utils/Ipc";
import { saveRoom, Identity } from "./utils/localStorage/room";

import "./JoinPage.less";

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
            radioValue: 1,
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
        saveRoom({
            uuid: this.state.roomId,
            userId,
            identity: Identity.joiner,
        });
        this.props.history.push(`/whiteboard/${Identity.joiner}/${this.state.roomId}/${userId}/`);
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
                            <Radio.Group value={radioValue}>
                                <Radio
                                    style={{ display: "block", marginTop: 16, color: "#444E60" }}
                                    value={1}
                                >
                                    开启麦克风
                                </Radio>
                                <Radio style={{ marginTop: 16, color: "#444E60" }} value={2}>
                                    开启摄像头
                                </Radio>
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
