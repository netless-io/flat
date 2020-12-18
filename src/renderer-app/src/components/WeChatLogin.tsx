import React from "react";
import { io, Socket } from "socket.io-client";
import { FLAT_SERVER_LOGIN } from "../constants/FlatServer";
import { QRURL } from "../utils/WeChatURL";
import "./WeChatLogin.less";
import { fetcher } from "../utils/Fetcher";

export enum Status {
    NoLogin = -1,
    Success,
    Failed,
    Process,
    AuthFailed,
}

export interface WeChatLoginResponse {
    status: Status;
    message: string;
    data: {
        userid: string;
        token: string;
    };
}

export type WeChatLoginStates = {
    uuid: string;
    ws: Socket;
    QRURL: string;
};

export type WeChatLoginProps = {};

interface LoginResponse {
    name: string;
    sex: 0 | 1 | 2; // 0: 未知，1: 男性，2: 女性
    avatar: string; // 头像地址
    userUUID: string; // 用户信息，需要进行保存
}
export default class WeChatLogin extends React.Component<WeChatLoginProps, WeChatLoginStates> {
    public constructor(props: WeChatLoginProps & WeChatLoginStates) {
        super(props);
        const ws = io(FLAT_SERVER_LOGIN.WSS_LOGIN, {
            transports: ["websocket"],
        });
        const uuid = Math.random().toString(36).substring(2);
        this.state = {
            uuid,
            ws,
            QRURL: "",
        };
    }

    public WeChatLoginFlow() {
        const { ws: socket, uuid } = this.state;

        socket.on("connect", () => {                                                                                                                                                                                                                
            socket.emit("WeChat/AuthID", {
                uuid,
            });
        });

        socket.on("WeChat/AuthID", (data: { status: Status; message: string }) => {
            if (data.status === 0) {
                this.setState({
                    QRURL: QRURL(this.state.ws.id, uuid),
                });
                console.log("serve 已经收到，开始展示二维码");
            } else {
                console.log("server 出现问题，请重试", data.message);
            }
        });

        socket.on("WeChat/LoginStatus", async (resp: WeChatLoginResponse) => {
            const { status, message, data } = resp;

            switch (status) {
                case Status.Success: {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userid", data.userid);
                    const res = await fetcher.post<LoginResponse>(FLAT_SERVER_LOGIN.HTTPS_LOGIN)
                    console.log("res.data", res.data);
                    console.log("登陆成功", data);
                    break;
                }
                case Status.AuthFailed: {
                    console.log("认证失败，请重试", message);
                    break;
                }
                case Status.Process: {
                    console.log("正在处理");
                    break;
                }
                default:
                    break;
            }
        });
    }

    public componentDidMount(): void {
        this.WeChatLoginFlow();
    }

    public componentWillUnmount() {
        this.state.ws.disconnect();
    }

    public render(): React.ReactNode {
        return (
            <div className="iframe-container">
                <iframe
                    title="wechat"
                    style={{
                        height: 333,
                        transform: "scale(0.7) translateY(-80px)",
                        marginBottom: -100,
                    }}
                    src={this.state.QRURL}
                    scrolling="no"
                    frameBorder="0"
                ></iframe>
            </div>
        );
    }
}
