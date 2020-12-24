import React from "react";
import { fetcher } from "./utils/Fetcher";
import { FLAT_SERVER_LOGIN } from "./constants/FlatServer";
import { RouteComponentProps } from "react-router";
import { getWechatInfo } from "./utils/localStorage/accounts";

interface LoginResponse {
    token: string;
    name: string;
    sex: 0 | 1 | 2; // 0: 未知，1: 男性，2: 女性
    avatar: string; // 头像地址
    userUUID: string; // 用户信息，需要进行保存
}

export default class IndexPage extends React.PureComponent<RouteComponentProps, {}> {
    private isUnmounted = false;
    private checkLoginSetTimeoutID = 0;

    public componentWillUnmount = () => {
        this.isUnmounted = true;
        this.checkLoginSetTimeoutID = window.setTimeout(this.checkLoginStatus, 2000);
    };

    public pushHistory = (path: string) => {
        if (!this.isUnmounted) {
            this.props.history.push(path);
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

    public componentDidMount() {
        this.checkLoginSetTimeoutID = window.setTimeout(this.checkLoginStatus, 2000);
    }

    public render() {
        return (
            <div className="index-container">
                {/* TODO The first screen SVG */}
                Hello
            </div>
        );
    }
}
