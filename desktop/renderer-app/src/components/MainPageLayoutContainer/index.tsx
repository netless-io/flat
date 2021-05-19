/* eslint-disable react/display-name */
import homeSVG from "./icons/home.svg";
import homeActiveSVG from "./icons/home-active.svg";
import diskSVG from "./icons/disk.svg";
import diskActiveSVG from "./icons/disk-active.svg";
import deviceSVG from "./icons/device.svg";
import deviceActiveSVG from "./icons/device-active.svg";
import settingSVG from "./icons/setting.svg";
import gitHubSVG from "./icons/github.svg";
import feedbackSVG from "./icons/feedback.svg";
import logoutSVG from "./icons/logout.svg";
import "./index.less";

import React, { useContext } from "react";
import { shell } from "electron";
import { useHistory, useLocation } from "react-router-dom";
import { MainPageLayout, MainPageLayoutItem, MainPageLayoutProps } from "flat-components";
import { routeConfig, RouteNameType } from "../../route-config";
import { GlobalStoreContext } from "../StoreProvider";

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
            key: routeConfig[RouteNameType.GeneralSettingPage].path,
            icon: (): React.ReactNode => <img src={settingSVG} />,
            title: "个人设置",
            route: routeConfig[RouteNameType.GeneralSettingPage].path,
        },
        {
            key: "getGitHubCode",
            icon: (): React.ReactNode => <img src={gitHubSVG} />,
            title: "获取源码",
            route: "https://github.com/netless-io/flat/",
        },
        {
            key: "feedback",
            icon: (): React.ReactNode => <img src={feedbackSVG} />,
            title: "反馈意见",
            route: "https://github.com/netless-io/flat/issues",
        },
        {
            key: "logout",
            icon: (): React.ReactNode => <img src={logoutSVG} />,
            title: (
                <span className="logout-title" onClick={() => localStorage.clear()}>
                    退出登录
                </span>
            ),
            route: routeConfig[RouteNameType.LoginPage].path,
        },
    ];

    const location = useLocation();

    activeKeys ??= [location.pathname];

    const history = useHistory();

    const globalStore = useContext(GlobalStoreContext);

    const historyPush = (mainPageLayoutItem: MainPageLayoutItem): void => {
        if (mainPageLayoutItem.route.startsWith("/")) {
            onRouteChange
                ? onRouteChange(mainPageLayoutItem)
                : history.push(mainPageLayoutItem.route);
        } else {
            void shell.openExternal(mainPageLayoutItem.route);
        }
    };

    return (
        <MainPageLayout
            sideMenu={sideMenu}
            sideMenuFooter={sideMenuFooter}
            popMenu={popMenu}
            subMenu={subMenu}
            onClick={historyPush}
            activeKeys={activeKeys}
            avatarSrc={globalStore.userInfo?.avatar ?? ""}
            userName={globalStore.userInfo?.name ?? ""}
        >
            {children}
        </MainPageLayout>
    );
};
