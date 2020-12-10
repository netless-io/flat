import * as React from "react";
import "./IndexPage.less";
import { Link, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Button, Divider, Modal } from "antd"
import logo from "./assets/image/logo.svg";
import wechat from "./assets/image/wechat.svg"
import google from "./assets/image/google.svg"
import { shell } from "electron";
import { ipcAsyncByMain } from "./utils/Ipc";
import WeChatLogin from "./components/WeChatLogin";

export type IndexPageStates = {
    name: string;
    visible: boolean;
    isModalVisible: boolean;
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
            isModalVisible: false
        };

        ipcAsyncByMain("set-win-size", {
            width: 375,
            height: 667,
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

    public showModal = (): void => {
        this.setState({ isModalVisible: true })
    }
    
    public handleCancel = (): void => {
        this.setState({ isModalVisible: false })
    }

    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        <span>在线互动 让想法同步</span>
                    </div>
                    <div className="page-index-start-box">
                        <div className="page-index-img-box">
                            <div className="page-index-start-cell" onClick={this.showModal}>
                                <img src={wechat} alt={"wxLogin"} />
                                <span className="page-index-img-info">微信登录</span>
                            </div>
                        </div>
                        <div className="page-index-img-box">
                            <div className="page-index-start-cell">
                                <div onClick={this.handleCreate}>
                                    <img src={google} alt={"google login logo"} />
                                </div>
                                <span className="page-index-img-info">Google 登录</span>
                            </div>
                        </div>
                    </div>
                    <div className="page-index-line">
                        <Divider plain>2.1.0</Divider>
                    </div>
                    <div className="page-index-link-box">
                        <Button size="large" style={{width: 280}}>
                            <Link to={"/user/"}>加入房间</Link>
                        </Button>
                    </div>
                </div>
                <Modal
                    width={240}
                    footer={null}
                    mask={false}
                    centered={true}
                    visible={this.state.isModalVisible}
                    onCancel={this.handleCancel}
                >
                    <WeChatLogin />
                </Modal>
            </div>
        );
    }
}

export default withRouter(IndexPage);
