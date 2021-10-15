import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { loginCheck } from "../../api-middleware/flatServer";
import { GlobalStoreContext } from "../../components/StoreProvider";
import { RouteNameType, usePushHistory } from "../../utils/routes";

import logoSVG from "../../assets/image/logo.svg";
import "./SplashPage.less";
import { errorTips } from "../../components/Tips/ErrorTips";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { useTranslation } from "react-i18next";

enum LoginStatusType {
    Idle = "Idle",
    Loading = "Loading",
    Success = "Success",
    Failed = "Failed",
}

export const SplashPage = observer<{}>(function SplashPage() {
    useWindowSize("Splash");

    const { t } = useTranslation();
    const [loginStatus, updateLoginStatus] = useState(LoginStatusType.Idle);
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);

    useEffect(() => {
        let isUnMount = false;
        // wait 300ms before showing loading state
        const ticket = window.setTimeout(() => updateLoginStatus(LoginStatusType.Loading), 300);

        async function checkLogin(): Promise<RouteNameType.HomePage | RouteNameType.LoginPage> {
            let nextPage = RouteNameType.LoginPage;

            const token = globalStore.userInfo?.token;
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

        void Promise.all([checkLogin(), pWait1s]).then(([nextPage]) => {
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
                <span>{t("online-interaction-to-synchronize-ideas")}</span>
            </div>
        </div>
    );
});

export default SplashPage;
