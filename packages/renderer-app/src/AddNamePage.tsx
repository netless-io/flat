import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import "./AddNamePage.less";
import logo from "./assets/image/logo.svg";
import { Button, Input } from "antd";
import { ipcRenderer } from "electron";

export type JoinPageStates = {
    name: string;
};

export default class AddNamePage extends React.Component<RouteComponentProps<{}>, JoinPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        this.state = {
            name: "",
        };
        ipcRenderer.send("mainSource", {
            actions: "set-win-size",
            args: {
                width: 480,
                height: 480,
            },
        });
    }

    private handleJoin = (): void => {
        const { name } = this.state;
        localStorage.setItem("userName", name);
        this.props.history.push(`/whiteboard/`);
    };

    public render(): React.ReactNode {
        const { name } = this.state;
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} />
                        <span>0.0.1</span>
                    </div>
                    <div className="page-index-form-box">
                        <Input
                            placeholder={"输入昵称"}
                            maxLength={8}
                            value={name}
                            onChange={evt => this.setState({ name: evt.target.value })}
                            style={{ width: 384, marginBottom: 28 }}
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
                                disabled={name === ""}
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
