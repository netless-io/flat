import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import logo from "./assets/image/logo.svg";
import join from "./assets/image/join.svg";
import create from "./assets/image/create.svg";
import "./IndexPage.less";
import { Button, Input, Popover } from "antd";
import { ipcRenderer, shell } from "electron";

export type IndexPageStates = {
    name: string;
    visible: boolean;
};

export enum Identity {
    creator = "creator",
    joiner = "joiner",
}

class IndexPage extends React.Component<RouteComponentProps<{}>, IndexPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            name: name ? name : "",
            visible: false,
        };
        ipcRenderer.send("mainSource", {
            actions: "set-win-size",
            args: {
                width: 480,
                height: 480,
            },
        });
    }

    private handleCreate = (): void => {
        if (this.state.name) {
            this.props.history.push(`/create/`);
        } else {
            this.props.history.push("/name/");
        }
    };

    private updateName = (isEmpty?: boolean): void => {
        if (isEmpty) {
            localStorage.removeItem("userName");
            this.setState({ visible: false, name: "" });
        } else {
            localStorage.setItem("userName", this.state.name);
            this.setState({ visible: false });
        }
    };

    private openGithub = async (): Promise<void> => {
        await shell.openExternal("https://github.com/netless-io/Flat-native");
    };

    private openLanding = async (): Promise<void> => {
        await shell.openExternal("https://netless.link/");
    };

    private openMIT = async (): Promise<void> => {
        await shell.openExternal("https://opensource.org/licenses/MIT");
    };
    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        {localStorage.getItem("rooms") && (
                            <Link to={"/history"}>
                                <div className="page-index-history">历史记录</div>
                            </Link>
                        )}
                        <Popover
                            visible={this.state.visible}
                            placement={"bottom"}
                            trigger="click"
                            content={
                                <div className="page-index-name-box">
                                    <Input
                                        maxLength={8}
                                        onChange={e => this.setState({ name: e.target.value })}
                                        value={this.state.name}
                                        style={{ width: 120 }}
                                        size={"small"}
                                    />
                                    <Button
                                        onClick={() => this.updateName()}
                                        style={{ width: 120, marginTop: 12 }}
                                        type={"primary"}
                                        size={"small"}
                                    >
                                        更新
                                    </Button>
                                    <Button
                                        onClick={() => this.updateName(true)}
                                        style={{ width: 120, marginTop: 12 }}
                                        size={"small"}
                                    >
                                        清空
                                    </Button>
                                </div>
                            }
                            title={"编辑昵称"}
                        >
                            <span onClick={() => this.setState({ visible: true })}>
                                <span style={{ color: "#3381FF" }}>{this.state.name}</span>
                                <span>
                                    欢迎使用{" "}
                                    <span role="img" aria-label="waving-hand">
                                        👋
                                    </span>
                                </span>
                            </span>
                        </Popover>
                    </div>
                    <div className="page-index-start-box">
                        <div className="page-index-start-cell">
                            <Link to={"/join/"}>
                                <img src={join} alt={"join"} />
                            </Link>
                            <span>加入房间</span>
                        </div>
                        <div className="page-cutline-box" />
                        <div className="page-index-start-cell">
                            <div onClick={this.handleCreate}>
                                <img src={create} alt={"create"} />
                            </div>
                            <span>创建房间</span>
                        </div>
                    </div>
                    <div className="page-index-link-box">
                        <div className="page-index-cell-left">
                            <span onClick={this.openLanding}>官网</span>
                        </div>
                        <div className="page-cutline-link-box" />
                        <div className="page-index-cell-right">
                            <span onClick={this.openGithub}>Github</span>
                        </div>
                    </div>
                    <div className="page-index-start-term">
                        本开源项目遵循
                        <span onClick={this.openMIT}>《 MIT 开源协议》</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(IndexPage);
