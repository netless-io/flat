import React, { ReactNode } from "react"
import {io, Socket} from "socket.io-client"
import "./WeChatLogin.less"

export enum Status {
    NoLogin = -1,
    Success,
    Failed,
    Process,
    AuthFailed,
}

export interface resp {
    status: Status;
    message: string;
    data: data;
}

export type data = {
    userid: string
}

export type WeChatLoginStates = {
    step: number; // 0 (emit) 1 (wait for connect) 2 (get status) 3 (finish)
    self_redirect: boolean;
    appid: string;
    scope: string;
    state?: string;
    theme?: string;
    href?: string;
    ws: Socket;
    wxSrc: string;
};

export type WeChatLoginProps = {
}


export default class WeChatLogin extends React.Component<WeChatLoginProps, WeChatLoginStates> {
    public constructor(props: WeChatLoginProps & WeChatLoginStates) {
        super(props);
        const ws = io("wss://api-flat.netless.group/v1/Login", {
            transports: ["websocket"],
        });
        const uuid = Math.random().toString(36).substring(2);
        console.log(process.env);
        const appId = process.env.APPID ?? ''
        this.state = {
            step: 0,
            self_redirect: true,
            appid: appId,
            scope: "snsapi_login",
            state: uuid,
            theme: "",
            href: "",
            ws: ws,
            wxSrc: "",
        };
    }

    public getRedirectUrl() {
        return `https://api-flat.netless.group/v1/login/weChat/callback/${this.state.ws.id}`
    }

    public WeChatLoginFlow() {
        const socket = this.state.ws;
        socket.on("connect", () => {
            socket.emit("WeChat/AuthID", {
                uuid: this.state.state,
            });
        });

        socket.on("WeChat/AuthID", (data: { status: Status; message: string }) => {
            if (data.status === 0) {
                const wxSrc = `https://open.weixin.qq.com/connect/qrconnect?appid=${
                    this.state.appid
                }&scope=${this.state.scope}&redirect_uri=${encodeURIComponent(
                    this.getRedirectUrl(),
                )}&state=${this.state.state || ""}&login_type=jssdk&self_redirect=default&style=${
                    this.state.theme || "black"
                }&href=${this.state.href || ""}`;
                this.setState({wxSrc: wxSrc})
                console.log("serve 已经收到，开始展示二维码");
            } else {
                console.log("server 出现问题，请重试", data.message);
            }
        });

        socket.on("WeChat/LoginStatus", (resp: resp) => {
            const { status, message, data } = resp;

            switch (status) {
                case 0: {
                    localStorage.setItem("userid", data.userid);
                    console.log("登陆成功", data);
                    break;
                }
                case 1: {
                    console.log("认证失败，请重试", message);
                    break;
                }
                case 2: {
                    console.log("正在处理");
                    break;
                }
            }
        });
    }

    public componentDidMount(): void {
        this.WeChatLoginFlow();
    }

    public render(): React.ReactNode {
        return (
            <div className="iframe-container">
                <iframe
                    style={{
                        height: 333,
                        transform: "scale(0.7) translateY(-80px)",
                        marginBottom: -100,
                    }}
                    src={this.state.wxSrc}
                    scrolling="no"
                    frameBorder="0"
                ></iframe>
            </div>
        );
    }
}