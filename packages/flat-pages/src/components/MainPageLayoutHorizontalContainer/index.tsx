/* eslint react/display-name: off */
import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation } from "react-router-dom";
import {
    MainPageLayoutHorizontal,
    MainPageLayoutItem,
    MainPageLayoutTreeItem,
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
import { useTranslate } from "@netless/flat-i18n";
import { routeConfig, RouteNameType } from "../../route-config";
import { GlobalStoreContext } from "../StoreProvider";
import { generateAvatar } from "../../utils/generate-avatar";
import { FLAT_DOWNLOAD_URL } from "../../constants/process";

export interface MainPageLayoutHorizontalContainerProps {
    subMenu?: MainPageLayoutTreeItem[];
    activeKeys?: string[];
    onRouteChange?: MainPageLayoutProps["onClick"];
    title?: React.ReactNode;
    onBackPreviousPage?: () => void;
}

export const MainPageLayoutHorizontalContainer = observer<MainPageLayoutHorizontalContainerProps>(
    function MainPageLayoutHorizontalContainer({
        subMenu,
        children,
        activeKeys,
        onRouteChange,
        title,
        onBackPreviousPage,
    }) {
        const t = useTranslate();
        const leftMenu: MainPageLayoutItem[] = [
            {
                key: routeConfig[RouteNameType.HomePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGHomeFilled active={active} /> : <SVGHomeOutlined />;
                },
                title: t("home"),
                route: routeConfig[RouteNameType.HomePage].path,
            },
            {
                key: routeConfig[RouteNameType.CloudStoragePage].path,
                icon: (active: boolean): React.ReactNode => {
                    return active ? <SVGCloudFilled active={active} /> : <SVGCloudOutlined />;
                },
                title: t("cloud-storage"),
                route: routeConfig[RouteNameType.CloudStoragePage].path,
            },
        ];

        const rightMenu: MainPageLayoutItem[] = [
            {
                key: "download",
                icon: (): React.ReactNode => <SVGDownload />,
                title: <></>,
                route: FLAT_DOWNLOAD_URL,
            },
            {
                key: "getGitHubCode",
                icon: (): React.ReactNode => <SVGGithub />,
                title: <></>,
                route: "https://github.com/netless-io/flat/",
            },
            {
                key: routeConfig[RouteNameType.GeneralSettingPage].path,
                icon: (): React.ReactNode => <SVGSetting />,
                title: <></>,
                route: routeConfig[RouteNameType.GeneralSettingPage].path,
            },
        ];

        const popMenu: MainPageLayoutItem[] = [
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
                userName={globalStore.userName ?? ""}
                onBackPreviousPage={onBackPreviousPage}
                onClick={onMenuItemClick}
            >
                {children}
            </MainPageLayoutHorizontal>
        );
    },
);
