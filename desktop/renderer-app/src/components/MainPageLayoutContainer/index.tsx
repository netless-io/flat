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
    SVGSun,
    SVGMoon,
    SVGSettingFilled,
} from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { useMedia } from "react-use";
import { routeConfig, RouteNameType } from "../../route-config";

import {
    GlobalStoreContext,
    PreferencesStoreContext,
    RuntimeContext,
    WindowsSystemBtnContext,
} from "@netless/flat-pages/src/components/StoreProvider";
import { generateAvatar } from "@netless/flat-pages/src/utils/generate-avatar";

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
        const runtime = useContext(RuntimeContext);
        const preferenceStore = useContext(PreferencesStoreContext);
        const windowsBtnContext = useContext(WindowsSystemBtnContext);
        const prefersDark = useMedia("(prefers-color-scheme: dark)");
        const theme =
            preferenceStore.prefersColorScheme === "auto"
                ? prefersDark
                    ? "dark"
                    : "light"
                : preferenceStore.prefersColorScheme;

        const sideMenu: MainPageLayoutItem[] = [
            {
                key: routeConfig[RouteNameType.HomePage].path,
                title: "home",
                htmlTitle: t("home"),
                route: routeConfig[RouteNameType.HomePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGHomeFilled /> : <SVGHomeOutlined />;
                },
            },
            {
                key: routeConfig[RouteNameType.CloudStoragePage].path,
                title: "cloudStorage",
                htmlTitle: t("cloud-storage"),
                route: routeConfig[RouteNameType.CloudStoragePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGCloudFilled /> : <SVGCloudOutlined />;
                },
            },
        ];

        const sideMenuFooter: MainPageLayoutItem[] = [
            {
                key: "theme",
                title: t("app-appearance-setting"),
                htmlTitle: t("app-appearance-" + (theme === "dark" ? "light" : "dark")),
                route: routeConfig[RouteNameType.GeneralSettingPage].path,
                icon: theme === "dark" ? () => <SVGSun /> : () => <SVGMoon />,
            },
            {
                key: routeConfig[RouteNameType.GeneralSettingPage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGSettingFilled /> : <SVGSetting />;
                },
                title: t("settings"),
                htmlTitle: t("settings"),
                route: routeConfig[RouteNameType.GeneralSettingPage].path,
            },
            {
                key: "deviceCheck",
                title: "deviceCheck",
                htmlTitle: t("device-test"),
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
                route: process.env.FEEDBACK_URL,
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

            if (mainPageLayoutItem.key === "theme") {
                preferenceStore.updatePrefersColorScheme(theme === "dark" ? "light" : "dark");
                return;
            }

            if (mainPageLayoutItem.route.startsWith("/")) {
                onRouteChange
                    ? onRouteChange(mainPageLayoutItem)
                    : history.push(mainPageLayoutItem.route);
            } else {
                void window.electron.shell.openExternal(mainPageLayoutItem.route);
            }
        };

        const topBarMenu: MainPageTopBarMenuItem[] = [
            {
                key: "github",
                icon: <SVGGithub />,
                route: "https://github.com/netless-io/flat",
                htmlTitle: "netless-io/flat",
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
                isMac={runtime?.isMac}
                popMenu={popMenu}
                showMainPageHeader={showMainPageHeader}
                showWindowsSystemBtn={windowsBtnContext?.showWindowsBtn}
                sideMenu={sideMenu}
                sideMenuFooter={sideMenuFooter}
                subMenu={subMenu}
                title={MainPageHeaderTitle}
                topBarMenu={topBarMenu}
                userName={globalStore.userName ?? ""}
                userUUID={globalStore.userUUID ?? ""}
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
