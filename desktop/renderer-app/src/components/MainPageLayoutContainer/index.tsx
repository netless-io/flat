/* eslint react/display-name: off */

import React, { useContext } from "react";
import { shell } from "electron";
import { MainPageLayout, MainPageLayoutItem, MainPageLayoutProps } from "flat-components";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { RouteNameType, routeConfig } from "../../route-config";
import { generateAvatar } from "../../utils/generate-avatar";
import { GlobalStoreContext } from "../StoreProvider";
import deviceActiveSVG from "./icons/device-active.svg";
import deviceSVG from "./icons/device.svg";
import diskActiveSVG from "./icons/disk-active.svg";
import diskSVG from "./icons/disk.svg";
import feedbackSVG from "./icons/feedback.svg";
import gitHubSVG from "./icons/github.svg";
import homeActiveSVG from "./icons/home-active.svg";
import homeSVG from "./icons/home.svg";
import logoutSVG from "./icons/logout.svg";
import settingSVG from "./icons/setting.svg";
import "./index.less";

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
    const { t } = useTranslation();
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
            title: t("settings"),
            route: routeConfig[RouteNameType.GeneralSettingPage].path,
        },
        {
            key: "getGitHubCode",
            icon: (): React.ReactNode => <img src={gitHubSVG} />,
            title: t("source-code"),
            route: "https://github.com/netless-io/flat/",
        },
        {
            key: "feedback",
            icon: (): React.ReactNode => <img src={feedbackSVG} />,
            title: t("feedback"),
            route: "https://github.com/netless-io/flat/issues",
        },
        {
            key: "logout",
            icon: (): React.ReactNode => <img src={logoutSVG} />,
            title: <span className="logout-title">{t("logout")}</span>,
            route: routeConfig[RouteNameType.LoginPage].path,
        },
    ];

    const location = useLocation();

    activeKeys ??= [location.pathname];

    const history = useHistory();

    const globalStore = useContext(GlobalStoreContext);

    const onMenuItemClick = (mainPageLayoutItem: MainPageLayoutItem): void => {
        if (mainPageLayoutItem.key === "logout") {
            globalStore.logout();
        }

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
            activeKeys={activeKeys}
            avatarSrc={globalStore.userInfo?.avatar ?? ""}
            generateAvatar={generateAvatar}
            popMenu={popMenu}
            sideMenu={sideMenu}
            sideMenuFooter={sideMenuFooter}
            subMenu={subMenu}
            userName={globalStore.userInfo?.name ?? ""}
            onClick={onMenuItemClick}
        >
            {children}
        </MainPageLayout>
    );
};
