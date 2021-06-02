import "./style.less";

import React, { useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { LoginChannelType, LoginPanel } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { WeChatLogin } from "./WeChatLogin";

export const LoginPage = observer(function LoginPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();

    useEffect(() => {
        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
        };
    }, []);

    const handleLogin = (loginChannel: LoginChannelType): React.ReactElement | undefined => {
        if (loginDisposer.current) {
            loginDisposer.current();
            loginDisposer.current = void 0;
        }

        switch (loginChannel) {
            case "github": {
                loginDisposer.current = githubLogin(authData => {
                    globalStore.updateUserInfo(authData);
                    pushHistory(RouteNameType.HomePage);
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

    return (
        <div className="login-page-container">
            <LoginPanel onLogin={handleLogin} />
        </div>
    );
});

export default LoginPage;
