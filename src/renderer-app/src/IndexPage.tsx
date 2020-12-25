import React from "react";
import { fetcher } from "./utils/fetcher";
import { FLAT_SERVER_LOGIN } from "./constants/FlatServer";
import { RouteComponentProps } from "react-router";
import { getWechatInfo } from "./utils/localStorage/accounts";
import logo from "./assets/image/logo.svg";
import classNames from "classnames";
import "./IndexPage.less"

interface LoginResponse {
    token: string;
    name: string;
    sex: 0 | 1 | 2; // 0: 未知，1: 男性，2: 女性
    avatar: string; // 头像地址
    userUUID: string; // 用户信息，需要进行保存
}

type IndexPageState = {
    status: string;
}

type SetStateParamType = Parameters<React.PureComponent['setState']>[0];

export default class IndexPage extends React.PureComponent<RouteComponentProps, IndexPageState> {
    public constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            status: "idle"
        }
    }

    private isUnmounted = false;
    private checkLoginSetTimeoutID = 0;

    public setAsyncState = (state: SetStateParamType) => {
        if(!this.isUnmounted) this.setState(state)
    }

    public showLoading = () => {
        this.setState({status: "loading"})
    }

    public componentWillUnmount = () => {
        this.isUnmounted = true;
        this.checkLoginSetTimeoutID = window.setTimeout(this.checkLoginStatus, 2000);
    };

    public pushHistory = (path: string) => {
        if (!this.isUnmounted) {
            window.setTimeout(() => {
                this.props.history.push(path);
            }, 1000)
        }
    };

    public checkLoginStatus = async () => {
        const token = getWechatInfo()?.token
        if (token === null) {
            this.pushHistory("/login/");
        } else {
            try {
                await fetcher.post<LoginResponse>(FLAT_SERVER_LOGIN.HTTPS_LOGIN);
                this.pushHistory("/user/");
            } catch {
                this.pushHistory("/login/");
            }
        }
    };

    public async componentDidMount() {
        const loading = window.setTimeout(this.showLoading, 300);
        await this.checkLoginStatus();
        window.clearTimeout(loading);
        this.setAsyncState({ status: "success" })
    }

    public render() {
        return (
            <div className="index-container">
                <div className="fade-container">
                    <div
                        className={classNames({
                            // TODO: loading: this.state.status === "loading",
                            success: this.state.status === "success",
                        })}
                    >
                        <img src={logo} alt="flat logo" />
                        <span>在线互动 让想法同步</span>
                    </div>
                </div>
            </div>
        );
    }
}
