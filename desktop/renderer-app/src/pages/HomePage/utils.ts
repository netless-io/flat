import { matchPath } from "react-router-dom";
import { routeConfig } from "../../route-config";

export const shouldWindowCenter = (pathname?: string): boolean => {
    if (!pathname) {
        return false;
    }

    if (pathname === routeConfig.SplashPage.path) {
        return true;
    }

    return [
        routeConfig.LoginPage,
        routeConfig.BigClassPage,
        routeConfig.OneToOnePage,
        routeConfig.SmallClassPage,
    ].some(({ path }) => {
        return !!matchPath(pathname, {
            path,
            sensitive: true,
        });
    });
};
