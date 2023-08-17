import "./WeChatLogin.less";

import React, { useEffect, useState } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { LoadingOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from "uuid";
import {
    loginProcess,
    LoginProcessResult,
    setAuthUUID,
    FLAT_SERVER_LOGIN,
} from "@netless/flat-server-api";
import { errorTips } from "flat-components";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { globalStore } from "@netless/flat-stores";

export interface WeChatLoginProps {
    onLoginResult: (result: LoginProcessResult) => void;
}

export const WeChatLogin = observer(function WeChatLogin({ onLoginResult }: WeChatLoginProps) {
    const [qrCodeURL, setQRCodeURL] = useState("");
    const sp = useSafePromise();

    const t = useTranslate();

    useEffect(() => {
        const authUUID = uuidv4();
        const ticket: { current?: number } = {};

        setQRCodeURL(getQRCodeURL(authUUID));

        const loginProcessRequest = (ticket: { current?: number }, authUUID: string): void => {
            ticket.current = window.setTimeout(async () => {
                const data = await sp(loginProcess(authUUID));
                if (data.userUUID === "") {
                    loginProcessRequest(ticket, authUUID);
                } else {
                    onLoginResult(data);
                }
            }, 2000);
        };

        sp(setAuthUUID(authUUID))
            .then(loginProcessRequest.bind(null, ticket, authUUID))
            .catch(errorTips);

        return () => {
            window.clearTimeout(ticket.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="wechat-login-container">
            <iframe
                className="wechat-login-iframe"
                frameBorder="0"
                scrolling="no"
                src={qrCodeURL}
                title="wechat"
            />
            <div className="wechat-login-spin">
                <LoadingOutlined spin />
            </div>
            <span className="wechat-login-text">{t("wechat-login-tips")}</span>
        </div>
    );
});

export default WeChatLogin;

export function getQRCodeURL(
    authUUID: string,
    redirect_uri: string = FLAT_SERVER_LOGIN.WECHAT_CALLBACK,
): string {
    const appId = globalStore.serverRegionConfig?.wechat.webAppId;
    if (!appId) {
        console.warn("missing server region config");
    }
    const redirectURL = encodeURIComponent(`${redirect_uri}`);
    const qrCodeStyle = `
        .impowerBox .qrcode {
            width: 238px;
            margin: 0;
        }
        .impowerBox .title {
            display: none;
        }
        .status_icon {
            display: none;
        }
        .impowerBox .status {
            text-align: center;
        }
        .impowerBox .info {
            display: none;
        }
    `;

    return `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&scope=snsapi_login&redirect_uri=${redirectURL}&state=${authUUID}&login_type=jssdk&self_redirect=true&style=black&href=data:text/css;base64,${window.btoa(
        qrCodeStyle,
    )}`;
}
