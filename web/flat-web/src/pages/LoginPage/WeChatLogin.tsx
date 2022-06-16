import "./WeChatLogin.less";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from "uuid";
import { loginProcess, LoginProcessResult, setAuthUUID } from "../../api-middleware/flatServer";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { errorTips } from "../../components/Tips/ErrorTips";
import { WECHAT } from "../../constants/process";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface WeChatLoginProps {
    setLoginResult: (result: LoginProcessResult) => void;
}

export const WeChatLogin = observer(function WeChatLogin({ setLoginResult }: WeChatLoginProps) {
    const [qrCodeURL, setQRCodeURL] = useState("");
    const sp = useSafePromise();

    const { t } = useTranslation();

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
                    setLoginResult(data);
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

    return `https://open.weixin.qq.com/connect/qrconnect?appid=${
        WECHAT.APP_ID
    }&scope=snsapi_login&redirect_uri=${redirectURL}&state=${authUUID}&login_type=jssdk&self_redirect=true&style=black&href=data:text/css;base64,${window.btoa(
        qrCodeStyle,
    )}`;
}
