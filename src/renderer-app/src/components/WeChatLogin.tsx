import "./WeChatLogin.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { LoadingOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { QRURL } from "../utils/wechatUrl";
import { setWechatInfo, setUserUuid } from "../utils/localStorage/accounts";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { FLAT_SERVER_LOGIN, Status } from "../apiMiddleware/flatServer/constants";
import { NODE_ENV } from "../constants/Process";
import { GlobalStoreContext } from "./StoreProvider";

export interface WeChatLoginResponse {
    status: Status;
    code: number;
    data: {
        userUUID: string;
        token: string;
        name: string;
        avatar: string;
    };
}

export const WeChatLogin = observer(function WeChatLogin() {
    const globalStore = useContext(GlobalStoreContext);
    const [qrCodeURL, setQRCodeURL] = useState("");
    const pushHistory = usePushHistory();

    useEffect(() => {
        const socket = io(FLAT_SERVER_LOGIN.WSS_LOGIN, { transports: ["websocket"] });

        const uuid = uuidv4();

        socket.on("connect", () => {
            socket.emit("WeChat/AuthID", { uuid });
        });

        socket.on("WeChat/AuthID", (data: { status: Status; code: number }) => {
            if (data.status === 0) {
                setQRCodeURL(QRURL(socket.id, uuid));
                if (NODE_ENV === "development") {
                    console.log("server 已经收到，开始展示二维码");
                }
            } else {
                if (NODE_ENV === "development") {
                    console.log(`server 出现问题，请重试。错误代码：${data.code}`);
                }
            }
        });

        socket.on("WeChat/LoginStatus", (resp: WeChatLoginResponse) => {
            const { status, code, data } = resp;

            switch (status) {
                case Status.Success: {
                    setWechatInfo(data);
                    setUserUuid(data.userUUID);
                    globalStore.updateWechat(data);
                    if (NODE_ENV === "development") {
                        console.log("登陆成功", data);
                    }
                    pushHistory(RouteNameType.HomePage);
                    break;
                }
                case Status.AuthFailed: {
                    if (NODE_ENV === "development") {
                        console.log(`认证失败，请重试。错误代码：${code}`);
                    }
                    break;
                }
                case Status.Process: {
                    if (NODE_ENV === "development") {
                        console.log("正在处理");
                    }
                    break;
                }
                default:
                    break;
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [globalStore, pushHistory]);

    return (
        <div className="wechat-login-container">
            <iframe
                className="wechat-login-iframe"
                title="wechat"
                src={qrCodeURL}
                scrolling="no"
                frameBorder="0"
            />
            <div className="wechat-login-spin">
                <LoadingOutlined spin />
            </div>
        </div>
    );
});

export default WeChatLogin;
