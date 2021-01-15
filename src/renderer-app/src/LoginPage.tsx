import React from "react";
import "./LoginPage.less";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Button, Divider, Modal } from "antd";
import logo from "./assets/image/logo.svg";
import wechat from "./assets/image/wechat.svg";
import google from "./assets/image/google.svg";
import { shell } from "electron";
import { ipcAsyncByMain } from "./utils/ipc";
import WeChatLogin from "./components/WeChatLogin";

export type IndexPageStates = {
    name: string;
    visible: boolean;
    toggleLoginModel: boolean;
};

class LoginPage extends React.Component<RouteComponentProps<{}>, IndexPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            name: name || "",
            visible: false,
            toggleLoginModel: false,
        };
    }

    public componentDidMount = () => {
        ipcAsyncByMain("set-win-size", {
            width: 375,
            height: 667,
            autoCenter: true,
        });
    };

    private handleCreate = (): void => {
        // if (this.state.name) {
        //     this.props.history.push(`/create/`);
        // } else {
        //     this.props.history.push("/name/");
        // }
        // @TODO google 登陆
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
        this.setState({ toggleLoginModel: true });
    };

    public handleCancel = (): void => {
        this.setState({ toggleLoginModel: false });
    };

    public joinRoom = () => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 668,
            autoCenter: true,
        });

        this.props.history.push("/user/");
    };

    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        <span>在线互动 让想法同步</span>
                    </div>
                    {/*<div className="page-index-start-box page-index-fade-in">*/}
                    {/*    <div className="page-index-img-box">*/}
                    {/*        <div className="page-index-start-cell" onClick={this.showModal}>*/}
                    {/*            <img src={wechat} alt={"wxLogin"} />*/}
                    {/*            <span className="page-index-img-info">微信登录</span>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className="page-index-img-box">*/}
                    {/*        <div className="page-index-start-cell">*/}
                    {/*            <div onClick={this.handleCreate}>*/}
                    {/*                <img src={google} alt={"google login logo"} />*/}
                    {/*            </div>*/}
                    {/*            <span className="page-index-img-info">Google 登录</span>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div className="page-index-line page-index-fade-in">*/}
                    {/*    <Divider plain>2.1.0</Divider>*/}
                    {/*</div>*/}
                    <div className="page-login-under">
                        <Button
                            onClick={this.showModal}
                            className="page-login-under-btn"
                            type="primary"
                            size="large"
                        >
                            微信登录
                        </Button>
                        <div className="page-index-line page-index-fade-in">v2.1.0</div>
                    </div>
                </div>
                <Modal
                    width={240}
                    footer={null}
                    mask={false}
                    centered={true}
                    visible={this.state.toggleLoginModel}
                    onCancel={this.handleCancel}
                >
                    <WeChatLogin />
                </Modal>
            </div>
        );
    }
}

export default withRouter(LoginPage);
