import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import logo from "./assets/image/logo.svg";
import join from "./assets/image/join.svg";
import create from "./assets/image/create.svg";
import "./IndexPage.less";
import { shell } from "electron";
import { ipcAsyncByMain } from "./utils/Ipc";

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

        ipcAsyncByMain("set-win-size", {
            width: 480,
            height: 480,
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
                    <a className="page-index-span-box" onClick={this.openLanding}>
                        官网
                    </a>
                    <a className="page-index-span-box" onClick={this.openGithub}>
                        GitHub
                    </a>
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
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
                        {localStorage.getItem("rooms") && (
                            <Link to={"/history"}>
                                <div className="page-index-history">历史会议</div>
                            </Link>
                        )}
                        <Link to={"/storage/"}>
                            <div className="page-index-storage">预加载</div>
                        </Link>
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
