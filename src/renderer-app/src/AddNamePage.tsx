import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import "./AddNamePage.less";
import logo from "./assets/image/logo.svg";
import { Button, Input } from "antd";
import { Identity } from "./IndexPage";
import { ipcAsyncByMain } from './utils/Ipc';

export type JoinPageStates = {
    name: string;
    uuid: string;
};

export type AddNamePageProps = RouteComponentProps<{ uuid?: string }>;

export default class AddNamePage extends React.Component<AddNamePageProps, JoinPageStates> {
    public constructor(props: AddNamePageProps) {
        super(props);
        const { uuid } = this.props.match.params;
        this.state = {
            name: "",
            uuid: uuid ? uuid : "",
        };
        ipcAsyncByMain("set-win-size", {
            width: 480,
            height: 480,
        });
    }

    private handleJoin = (): void => {
        const { name } = this.state;
        const { uuid } = this.props.match.params;
        localStorage.setItem("userName", name);
        if (uuid) {
            this.props.history.push(`/whiteboard/${Identity.creator}/${uuid}/`);
        } else {
            this.props.history.push(`/whiteboard/${Identity.creator}/`);
        }
    };

    public render(): React.ReactNode {
        const { name, uuid } = this.state;
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        <span>0.0.1</span>
                    </div>
                    <div className="page-index-form-box">
                        <Input
                            placeholder={"输入昵称"}
                            maxLength={8}
                            value={name}
                            style={{ width: 384, marginBottom: 28 }}
                            onChange={evt => this.setState({ name: evt.target.value })}
                            size={"large"}
                        />
                        {uuid && (
                            <Input
                                value={uuid}
                                disabled={true}
                                style={{ width: 384, marginBottom: 28 }}
                                size={"large"}
                            />
                        )}
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
                                {uuid ? "加入房间" : "创建房间"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
