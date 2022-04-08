/* eslint react/display-name: off */
import React, { useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
    MainPageLayoutHorizontal,
    MainPageLayoutItem,
    MainPageLayoutProps,
    SVGCloudFilled,
    SVGCloudOutlined,
    SVGDownload,
    SVGFeedback,
    SVGGithub,
    SVGHomeFilled,
    SVGHomeOutlined,
    SVGLogout,
    SVGSetting,
} from "flat-components";
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

export const MainPageLayoutHorizontalContainer: React.FC<
    MainPageLayoutHorizontalContainerProps
> = ({ subMenu, children, activeKeys, onRouteChange, title, onBackPreviousPage }) => {
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

            route: FLAT_DOWNLOAD_URL,
        },
        {
            key: "getGitHubCode",

            route: "https://github.com/netless-io/flat/",
        },
        {
            key: routeConfig[RouteNameType.GeneralSettingPage].path,

            route: routeConfig[RouteNameType.GeneralSettingPage].path,
        },
    ];

    const popMenu = [
        {
            key: "feedback",
            icon: (): React.ReactNode => <SVGFeedback />,
            title: t("feedback"),
            route: "https://github.com/netless-io/flat/issues",
        },
        {
            key: "logout",
            icon: (): React.ReactNode => <SVGLogout />,
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
            activeKeys={activeKeys}
            avatarSrc={globalStore.userInfo?.avatar ?? ""}
            generateAvatar={generateAvatar}
            leftMenu={leftMenu}
            popMenu={popMenu}
            rightMenu={rightMenu}
            subMenu={subMenu}
            title={title}
            userName={globalStore.userInfo?.name ?? ""}
            onBackPreviousPage={onBackPreviousPage}
            onClick={onMenuItemClick}
        >
            {children}
        </MainPageLayoutHorizontal>
    );
};
