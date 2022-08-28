/* eslint react/display-name: off */
import "./index.less";

import React, { useContext } from "react";
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
} from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { routeConfig, RouteNameType } from "../../route-config";

import { generateAvatar } from "../../utils/generate-avatar";
import {
    GlobalStoreContext,
    WindowsSystemBtnContext,
} from "@netless/flat-pages/src/components/StoreProvider";

export interface MainPageLayoutContainerProps {
    subMenu?: MainPageLayoutItem[];
    activeKeys?: string[];
    MainPageHeaderTitle?: MainPageLayoutProps["title"];
    showMainPageHeader?: MainPageLayoutProps["showMainPageHeader"];
    onRouteChange?: MainPageLayoutProps["onClick"];
    onBackPreviousPage?: MainPageLayoutProps["onBackPreviousPage"];
}

export const MainPageLayoutContainer = observer<MainPageLayoutContainerProps>(
    function MainPageLayoutContainer({
        subMenu,
        children,
        activeKeys,
        MainPageHeaderTitle,
        showMainPageHeader,
        onRouteChange,
        onBackPreviousPage,
    }) {
        const t = useTranslate();
        const windowsBtnContext = useContext(WindowsSystemBtnContext);

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
                void window.electron.shell.openExternal(mainPageLayoutItem.route);
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
            void window.electron.shell.openExternal(mainPageTopBarMenuItem.route);
        };

        return (
            <MainPageLayout
                activeKeys={activeKeys}
                avatarSrc={globalStore.userInfo?.avatar ?? ""}
                generateAvatar={generateAvatar}
                popMenu={popMenu}
                showMainPageHeader={showMainPageHeader}
                showWindowsSystemBtn={windowsBtnContext?.showWindowsBtn}
                sideMenu={sideMenu}
                sideMenuFooter={sideMenuFooter}
                subMenu={subMenu}
                title={MainPageHeaderTitle}
                topBarMenu={topBarMenu}
                userName={globalStore.userInfo?.name ?? ""}
                onBackPreviousPage={onBackPreviousPage}
                onClick={onMenuItemClick}
                onClickTopBarMenu={onClickTopBarMenu}
                onClickWindowsSystemBtn={windowsBtnContext?.onClickWindowsSystemBtn}
            >
                {children}
            </MainPageLayout>
        );
    },
);
