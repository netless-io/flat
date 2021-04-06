import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { loginCheck } from "../../apiMiddleware/flatServer";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../utils/routes";

import logoSVG from "../../assets/image/logo.svg";
import "./SplashPage.less";
import { errorTips } from "../../components/Tips/ErrorTips";
import { useWindowSize } from "../../utils/hooks/useWindowSize";

enum LoginStatusType {
    Idle = "Idle",
    Loading = "Loading",
    Success = "Success",
    Failed = "Failed",
}

export interface SplashPageProps {}

export const SplashPage = observer<SplashPageProps>(function SplashPage() {
    useWindowSize("Splash");

    const [loginStatus, updateLoginStatus] = useState(LoginStatusType.Idle);
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);

    useEffect(() => {
        let isUnMount = false;
        // wait 300ms before showing loading state
        const ticket = window.setTimeout(() => updateLoginStatus(LoginStatusType.Loading), 300);

        async function checkLogin(): Promise<RouteNameType.HomePage | RouteNameType.LoginPage> {
            let nextPage = RouteNameType.LoginPage;

            const token = globalStore.wechat?.token;
            if (token) {
                try {
                    await loginCheck();
                    nextPage = RouteNameType.HomePage;
                } catch (e) {
                    console.error(e);
                    errorTips(e);
                }
            }

            if (!isUnMount) {
                updateLoginStatus(LoginStatusType.Success);
            }

            return nextPage;
        }

        // wait at least 1s until animation finishes
        const pWait1s = new Promise(resolve => setTimeout(resolve, 1000));

        Promise.all([checkLogin(), pWait1s]).then(([nextPage]) => {
            if (!isUnMount) {
                if (nextPage === RouteNameType.HomePage) {
                    pushHistory(nextPage);
                } else {
                    pushHistory(nextPage);
                }
            }
        });

        return () => {
            isUnMount = true;
            window.clearTimeout(ticket);
        };
        // Only check login once on start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="splash-container">
            <div
                className={classNames("splash-content", {
                    // @TODO add loading status
                    "is-success": loginStatus === LoginStatusType.Success,
                })}
            >
                <img src={logoSVG} alt="flat logo" />
                <span>在线互动 让想法同步</span>
            </div>
        </div>
    );
});

export default SplashPage;
