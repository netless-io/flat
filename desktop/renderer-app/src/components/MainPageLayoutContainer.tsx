/* eslint-disable react/display-name */
import homeSVG from "../assets/image/home.svg";
import homeActiveSVG from "../assets/image/home-active.svg";
import diskSVG from "../assets/image/disk.svg";
import diskActiveSVG from "../assets/image/disk-active.svg";
import deviceSVG from "../assets/image/device.svg";
import deviceActiveSVG from "../assets/image/device-active.svg";
import settingSVG from "../assets/image/setting.svg";
import gitHubSVG from "../assets/image/github.svg";
import logoutSVG from "../assets/image/logout.svg";

import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { MainPageLayout, MainPageLayoutItem, MainPageLayoutProps } from "flat-components";
import { getWechatInfo } from "../utils/localStorage/accounts";
import { routeConfig, RouteNameType } from "../route-config";

export interface MainPageLayoutContainerProps {
    subMenu?: MainPageLayoutItem[];
    activeKeys?: string[];
    onRouteChange?: MainPageLayoutProps["onClick"];
}

export const MainPageLayoutContainer: React.FC<MainPageLayoutContainerProps> = ({
    subMenu,
    children,
    activeKeys,
    onRouteChange,
}) => {
    const sideMenu = [
        {
            key: routeConfig[RouteNameType.HomePage].path,
            icon: (active: boolean): React.ReactNode => (
                <img src={active ? homeActiveSVG : homeSVG} />
            ),
            title: "home",
            route: routeConfig[RouteNameType.HomePage].path,
        },
        {
            key: routeConfig[RouteNameType.CloudStoragePage].path,
            icon: (active: boolean): React.ReactNode => (
                <img src={active ? diskActiveSVG : diskSVG} />
            ),
            title: "cloudStorage",
            route: routeConfig[RouteNameType.CloudStoragePage].path,
        },
    ];

    const sideMenuFooter = [
        {
            key: "deviceCheck",
            icon: (active: boolean): React.ReactNode => (
                <img src={active ? deviceActiveSVG : deviceSVG} />
            ),
            title: "deviceCheck",
            route: routeConfig[RouteNameType.SystemCheckPage].path,
        },
    ];

    const popMenu = [
        {
            key: "userConfig",
            icon: (): React.ReactNode => <img src={settingSVG} />,
            title: "userConfig",
            route: "/userConfig",
        },
        {
            key: "getGitHubCode",
            icon: (): React.ReactNode => <img src={gitHubSVG} />,
            title: "getGitHubCode",
            route: "/getGitHubCode",
        },
        {
            key: "logout",
            icon: (): React.ReactNode => <img src={logoutSVG} />,
            title: "logout",
            route: "/logout",
        },
    ];

    const location = useLocation();

    activeKeys ??= [location.pathname];

    const history = useHistory();

    const historyPush =
        onRouteChange ||
        ((mainPageLayoutItem: MainPageLayoutItem): void => {
            history.push(mainPageLayoutItem.route);
        });

    return (
        <MainPageLayout
            sideMenu={sideMenu}
            sideMenuFooter={sideMenuFooter}
            popMenu={popMenu}
            subMenu={subMenu}
            onClick={historyPush}
            activeKeys={activeKeys}
            avatarSrc={getWechatInfo()?.avatar ?? ""}
            userName={getWechatInfo()?.name ?? ""}
        >
            {children}
        </MainPageLayout>
    );
};
