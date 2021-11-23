/* eslint react/display-name: off */
// import deviceSVG from "./icons/device.svg";
// import deviceActiveSVG from "./icons/device-active.svg";
import downloadSVG from "./icons/download.svg";
import settingSVG from "./icons/setting.svg";
import gitHubSVG from "./icons/github.svg";
import feedbackSVG from "./icons/feedback.svg";
import logoutSVG from "./icons/logout.svg";

import React, { useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { MainPageLayoutHorizontal, MainPageLayoutItem, MainPageLayoutProps } from "flat-components";
import { useTranslation } from "react-i18next";
import { routeConfig, RouteNameType } from "../../route-config";
import { GlobalStoreContext } from "../StoreProvider";
import { generateAvatar } from "../../utils/generate-avatar";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";

export interface MainPageLayoutHorizontalContainerProps {
    subMenu?: MainPageLayoutItem[];
    activeKeys?: string[];
    onRouteChange?: MainPageLayoutProps["onClick"];
    title?: React.ReactNode;
    onBackPreviousPage?: () => void;
}

export const MainPageLayoutHorizontalContainer: React.FC<MainPageLayoutHorizontalContainerProps> =
    ({ subMenu, children, activeKeys, onRouteChange, title, onBackPreviousPage }) => {
        const { t } = useTranslation();
        const leftMenu = [
            {
                key: routeConfig[RouteNameType.HomePage].path,
                icon: (): React.ReactNode => <></>,
                title: t("home"),
                route: routeConfig[RouteNameType.HomePage].path,
            },
            {
                key: routeConfig[RouteNameType.CloudStoragePage].path,
                icon: (): React.ReactNode => <></>,
                title: t("cloud-storage"),
                route: routeConfig[RouteNameType.CloudStoragePage].path,
            },
        ];

        const rightMenu: MainPageLayoutItem[] = [
            {
                key: "download",
                icon: (): React.ReactNode => <img src={downloadSVG} />,
                title: t("nav-download"),
                route: FLAT_DOWNLOAD_URL,
            },
            {
                key: "getGitHubCode",
                icon: (): React.ReactNode => <img src={gitHubSVG} />,
                title: t("nav-source-code"),
                route: "https://github.com/netless-io/flat/",
            },
            {
                key: routeConfig[RouteNameType.GeneralSettingPage].path,
                icon: (): React.ReactNode => <img src={settingSVG} />,
                title: t("nav-settings"),
                route: routeConfig[RouteNameType.GeneralSettingPage].path,
            },
        ];

        const popMenu = [
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
                void window.open(mainPageLayoutItem.route);
            }
        };

        return (
            <MainPageLayoutHorizontal
                title={title}
                onBackPreviousPage={onBackPreviousPage}
                leftMenu={leftMenu}
                rightMenu={rightMenu}
                popMenu={popMenu}
                subMenu={subMenu}
                onClick={onMenuItemClick}
                activeKeys={activeKeys}
                avatarSrc={globalStore.userInfo?.avatar ?? ""}
                userName={globalStore.userInfo?.name ?? ""}
                generateAvatar={generateAvatar}
            >
                {children}
            </MainPageLayoutHorizontal>
        );
    };
