import "./WeChatLogin.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { LoadingOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { QRURL } from "../utils/wechatUrl";
import { setWechatInfo, setUserUuid } from "../utils/localStorage/accounts";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { GlobalStoreContext } from "./StoreProvider";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { setAuthUUID, loginProcess } from "../apiMiddleware/flatServer";
import { errorTips } from "./Tips/ErrorTips";
import type { WechatInfo } from "../stores/GlobalStore";

export const WeChatLogin = observer(function WeChatLogin() {
    const globalStore = useContext(GlobalStoreContext);
    const [qrCodeURL, setQRCodeURL] = useState("");
    const [authData, setAuthData] = useState<WechatInfo | null>(null);
    const pushHistory = usePushHistory();
    const sp = useSafePromise();

    useEffect(() => {
        const authUUID = uuidv4();
        const ticket: { current?: number } = {};

        setQRCodeURL(QRURL(authUUID));

        const loginProcessRequest = (ticket: { current?: number }, authUUID: string): void => {
            ticket.current = window.setTimeout(async () => {
                const data = await sp(loginProcess(authUUID));
                if (data.userUUID === "") {
                    loginProcessRequest(ticket, authUUID);
                } else {
                    setAuthData(data);
                }
            }, 2000);
        };

        sp(setAuthUUID(authUUID))
            .then(() => {
                loginProcessRequest(ticket, authUUID);
            })
            .catch(errorTips);

        return () => {
            window.clearTimeout(ticket.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (authData) {
            setWechatInfo(authData);
            setUserUuid(authData.userUUID);
            globalStore.updateWechat(authData);
            pushHistory(RouteNameType.HomePage);
        }
    }, [authData, globalStore, pushHistory]);

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
