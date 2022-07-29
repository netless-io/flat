/* eslint react/display-name: off */
import "./index.less";

import React, { useContext } from "react";
import { shell } from "electron";
import { useHistory, useLocation } from "react-router-dom";
import {
    MainPageLayout,
    MainPageLayoutItem,
    MainPageTopBarMenuItem,
    MainPageLayoutProps,
    SVGGithub,
    SVGHomeFilled,
    SVGHomeOutlined,
    SVGCloudFilled,
    SVGCloudOutlined,
    SVGTest,
    SVGTestFilled,
    SVGSetting,
    SVGFeedback,
    SVGLogout,
    WindowsSystemBtnItem,
} from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { routeConfig, RouteNameType } from "../../route-config";
import { GlobalStoreContext } from "../StoreProvider";
import { generateAvatar } from "../../utils/generate-avatar";
import { ipcAsyncByMainWindow } from "../../utils/ipc";
import { runtime } from "../../utils/runtime";

export interface MainPageLayoutContainerProps {
    subMenu?: MainPageLayoutItem[];
    activeKeys?: string[];
    onRouteChange?: MainPageLayoutProps["onClick"];
}

export const MainPageLayoutContainer = observer<MainPageLayoutContainerProps>(
    function MainPageLayoutContainer({ subMenu, children, activeKeys, onRouteChange }) {
        const { t } = useTranslation();
        const sideMenu = [
            {
                key: routeConfig[RouteNameType.HomePage].path,
                title: "home",
                route: routeConfig[RouteNameType.HomePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGHomeFilled /> : <SVGHomeOutlined />;
                },
            },
            {
                key: routeConfig[RouteNameType.CloudStoragePage].path,
                title: "cloudStorage",
                route: routeConfig[RouteNameType.CloudStoragePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGCloudFilled /> : <SVGCloudOutlined />;
                },
            },
        ];

        const sideMenuFooter = [
            {
                key: "deviceCheck",
                title: "deviceCheck",
                route: routeConfig[RouteNameType.SystemCheckPage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGTestFilled /> : <SVGTest />;
                },
            },
        ];

        const popMenu = [
            {
                key: routeConfig[RouteNameType.GeneralSettingPage].path,
                icon: (): React.ReactNode => <SVGSetting />,
                title: t("settings"),
                route: routeConfig[RouteNameType.GeneralSettingPage].path,
            },
            {
                key: "feedback",
                icon: (): React.ReactNode => <SVGFeedback />,
                title: t("feedback"),
                route:
                    process.env.FLAT_REGION === "CN"
                        ? "https://www.yuque.com/leooel/ec1kmm/vmsolg"
                        : "https://join.slack.com/t/agoraflat/shared_invite/zt-vdb09pf6-mD4hB7sDA4LXN2O5dhmEPQ",
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
                void shell.openExternal(mainPageLayoutItem.route);
            }
        };

        const topBarMenu = [
            {
                key: "github",
                icon: <SVGGithub />,
                route: "https://github.com/netless-io/flat/",
            },
        ];

        const onClickTopBarMenu = (mainPageTopBarMenuItem: MainPageTopBarMenuItem): void => {
            void shell.openExternal(mainPageTopBarMenuItem.route);
        };

        const onClickWindowsSystemBtn = (winSystemBtn: WindowsSystemBtnItem): void => {
            ipcAsyncByMainWindow("set-win-status", { windowStatus: winSystemBtn });
        };

        return (
            <MainPageLayout
                activeKeys={activeKeys}
                avatarSrc={globalStore.userInfo?.avatar ?? ""}
                generateAvatar={generateAvatar}
                isWin={runtime.isWin}
                popMenu={popMenu}
                sideMenu={sideMenu}
                sideMenuFooter={sideMenuFooter}
                subMenu={subMenu}
                topBarMenu={topBarMenu}
                userName={globalStore.userInfo?.name ?? ""}
                onClick={onMenuItemClick}
                onClickTopBarMenu={onClickTopBarMenu}
                onClickWindowsSystemBtn={onClickWindowsSystemBtn}
            >
                {children}
            </MainPageLayout>
        );
    },
);
