import "./index.less";

import React, { useContext, useEffect, useRef, useState } from "react";
import { constants } from "flat-types";
import { observer } from "mobx-react-lite";
import { withRouter } from "react-router-dom";
import { ipcAsyncByMainWindow, ipcSyncByApp } from "../../utils/ipc";
import { LoginChannelType, LoginPanel } from "flat-components";
import { LoginDisposer } from "./utils";
import { githubLogin } from "./githubLogin";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { AppUpgradeModal } from "../../components/AppUpgradeModal";
import { runtime } from "../../utils/runtime";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { WeChatLogin } from "./WeChatLogin";

export const LoginPage = observer<{}>(function LoginPage() {
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const loginDisposer = useRef<LoginDisposer>();
    const [newVersion, setNewVersion] = useState<string>();
    const sp = useSafePromise();

    useEffect(() => {
        ipcAsyncByMainWindow("set-win-size", {
            ...constants.PageSize.Main,
            autoCenter: true,
        });

        return () => {
            if (loginDisposer.current) {
                loginDisposer.current();
                loginDisposer.current = void 0;
            }
        };
    }, []);

    useEffect(() => {
        sp(ipcSyncByApp("get-update-info"))
            .then(data => {
                console.log("[Auto Updater]: Get Update Info");
                if (data.hasNewVersion) {
                    console.log(
                        `[Auto Updater]: Remote Version "${data.version}", Local Version "${runtime.appVersion}"`,
                    );
                    if (data.version !== runtime.appVersion) {
                        setNewVersion(data.version);
                    }
                }
            })
            .catch(err => {
                console.error("ipc failed", err);
            });
    }, [sp]);

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
            <AppUpgradeModal newVersion={newVersion} onClose={() => setNewVersion(void 0)} />
        </div>
    );
});

export default withRouter(LoginPage);
