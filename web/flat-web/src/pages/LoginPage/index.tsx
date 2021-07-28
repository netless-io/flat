import "./style.less";

import React, { useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { LoginChannelType, LoginPanel } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { WeChatLogin } from "./WeChatLogin";
import { joinRoomHandler } from "../utils/joinRoomHandler";
import { PRIVACY_URL, PRIVACY_URL_CN, SERVICE_URL, SERVICE_URL_CN } from "../../constants/Process";
import { useTranslation } from "react-i18next";

export const LoginPage = observer(function LoginPage() {
    const { i18n } = useTranslation();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();
    const roomUUID = sessionStorage.getItem("roomUUID");

    useEffect(() => {
        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
            sessionStorage.clear();
        };
    }, []);

    const handleLogin = (loginChannel: LoginChannelType): React.ReactElement | undefined => {
        if (loginDisposer.current) {
            loginDisposer.current();
            loginDisposer.current = void 0;
        }

        switch (loginChannel) {
            case "github": {
                loginDisposer.current = githubLogin(async authData => {
                    globalStore.updateUserInfo(authData);
                    if (roomUUID) {
                        await joinRoomHandler(roomUUID, pushHistory);
                    } else {
                        pushHistory(RouteNameType.HomePage);
                    }
                });
                return;
            }
            case "wechat": {
                return <WeChatLogin />;
            }
            default: {
                return;
            }
        }
    };

    const privacyURL = i18n.language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
    const serviceURL = i18n.language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;

    return (
        <div className="login-page-container">
            <LoginPanel onLogin={handleLogin} privacyURL={privacyURL} serviceURL={serviceURL} />
        </div>
    );
});

export default LoginPage;
