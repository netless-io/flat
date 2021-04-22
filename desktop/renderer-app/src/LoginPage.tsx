import "./LoginPage.less";

import React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { Button, Modal } from "antd";
import { constants } from "flat-types";
import logoSVG from "./assets/image/logo.svg";
import { ipcAsyncByMainWindow } from "./utils/ipc";
import WeChatLogin from "./components/WeChatLogin";
import { runtime } from "./utils/runtime";

export type IndexPageStates = {
    name: string;
    visible: boolean;
    toggleLoginModel: boolean;
};

export class LoginPage extends React.Component<RouteComponentProps<{}>, IndexPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            name: name || "",
            visible: false,
            toggleLoginModel: false,
        };
    }

    public componentDidMount = (): void => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Login,
            autoCenter: true,
        });
    };

    public showModal = (): void => {
        this.setState({ toggleLoginModel: true });
    };

    public handleCancel = (): void => {
        this.setState({ toggleLoginModel: false });
    };

    public render(): React.ReactNode {
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logoSVG} alt={"logo"} />
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
                        <div className="page-index-line page-index-fade-in">
                            Version {runtime.appVersion}
                        </div>
                    </div>
                </div>
                <Modal
                    width={240}
                    footer={null}
                    mask={false}
                    centered={true}
                    visible={this.state.toggleLoginModel}
                    onCancel={this.handleCancel}
                    destroyOnClose
                >
                    <WeChatLogin />
                </Modal>
            </div>
        );
    }
}

export default withRouter(LoginPage);
