import { useContext, useEffect, useState } from "react";
import { RouteNameType, useReplaceHistory } from "./routes";
import { GlobalStoreContext } from "../components/StoreProvider";
import { loginCheck, COOKIE_DOMAIN } from "@netless/flat-server-api";
import { errorTips } from "flat-components";

export function useLoginCheck(): boolean {
    const replaceHistory = useReplaceHistory();
    const globalStore = useContext(GlobalStoreContext);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        let isUnMount = false;

        async function checkLogin(): Promise<boolean> {
            if (!globalStore.userInfo?.token) {
                return false;
            }

            if (globalStore.lastLoginCheck) {
                if (Date.now() - globalStore.lastLoginCheck < 2 * 60 * 60 * 1000) {
                    return true;
                }
            }

            try {
                const result = await loginCheck();
                globalStore.updateUserInfo(result);
                globalStore.updateLastLoginCheck(Date.now());
                saveJWTToken(result.token);
                return globalStore.needPhoneBinding ? result.hasPhone : true;
            } catch (e) {
                globalStore.updateLastLoginCheck(null);
                console.error(e);
                errorTips(e as Error);
            }

            return false;
        }

        void checkLogin().then(isLoggedIn => {
            if (!isUnMount) {
                if (isLoggedIn) {
                    setIsLogin(true);
                } else {
                    replaceHistory(RouteNameType.LoginPage);
                }
            }
        });

        return () => {
            isUnMount = true;
        };
        // Only check login once on start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLogin;
}

export function saveJWTToken(token: string): void {
    const maxAge = 60 * 60 * 24 * 29; // 29 days
    document.cookie = `flatJWTToken=${token}; SameSite=Lax; domain=${COOKIE_DOMAIN}; max-age=${maxAge}`;
}
