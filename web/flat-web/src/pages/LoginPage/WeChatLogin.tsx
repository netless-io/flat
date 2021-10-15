import "./WeChatLogin.less";

import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { LoadingOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { UserInfo } from "../../stores/GlobalStore";
import { loginProcess, setAuthUUID } from "../../api-middleware/flatServer";
import { FLAT_SERVER_LOGIN } from "../../api-middleware/flatServer/constants";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { WECHAT } from "../../constants/process";
import { RouteNameType } from "../../route-config";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { usePushHistory } from "../../utils/routes";
import { joinRoomHandler } from "../utils/join-room-handler";
import { useTranslation } from "react-i18next";

export const WeChatLogin = observer(function WeChatLogin() {
    const globalStore = useContext(GlobalStoreContext);
    const [qrCodeURL, setQRCodeURL] = useState("");
    const [authData, setAuthData] = useState<UserInfo | null>(null);
    const pushHistory = usePushHistory();
    const sp = useSafePromise();
    const roomUUID = sessionStorage.getItem("roomUUID");

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
        const loginJump = async (): Promise<void> => {
            if (authData) {
                globalStore.updateUserInfo(authData);
                if (roomUUID) {
                    await joinRoomHandler(roomUUID, pushHistory);
                } else {
                    pushHistory(RouteNameType.HomePage);
                }
            }
        };

        void loginJump();
    }, [authData, globalStore, pushHistory, roomUUID]);

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
            <span className="wechat-login-text">{t("wechat-login-tips")}</span>
        </div>
    );
});

export default WeChatLogin;

function getQRCodeURL(authUUID: string): string {
    const redirectURL = encodeURIComponent(`${FLAT_SERVER_LOGIN.WECHAT_CALLBACK}`);
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
