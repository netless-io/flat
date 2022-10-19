/* eslint react/display-name: off */
import generalSVG from "./icons/general.svg";
import aboutSVG from "./icons/about.svg";
import hotkeySVG from "./icons/hotkey.svg";
import "./UserSettingLayoutContainer.less";

import React, { useContext, useEffect } from "react";
import { SVGApps, SVGCode } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { PageStoreContext } from "@netless/flat-pages/src/components/StoreProvider";
import { routeConfig, RouteNameType } from "../../route-config";

export const UserSettingLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    const t = useTranslate();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            subMenu: [
                {
                    key: routeConfig[RouteNameType.GeneralSettingPage].path,
                    icon: (): React.ReactNode => <img src={generalSVG} />,
                    title: t("general-settings"),
                    route: routeConfig[RouteNameType.GeneralSettingPage].path,
                },
                {
                    key: routeConfig[RouteNameType.HotKeySettingPage].path,
                    icon: (): React.ReactNode => <img src={hotkeySVG} />,
                    title: t("shortcut-settings"),
                    route: routeConfig[RouteNameType.HotKeySettingPage].path,
                },
                {
                    key: routeConfig[RouteNameType.ApplicationsPage].path,
                    icon: (active): React.ReactNode => <SVGApps active={active} />,
                    title: t("applications"),
                    route: routeConfig[RouteNameType.ApplicationsPage].path,
                },
                {
                    key: "developer",
                    icon: (active): React.ReactNode => <SVGCode active={active} />,
                    title: t("developer"),
                    route: "#",
                    children: [
                        {
                            key: routeConfig[RouteNameType.OAuthPage].path,
                            icon: () => null,
                            title: t("oauth-apps"),
                            route: routeConfig[RouteNameType.OAuthPage].path,
                        },
                    ],
                },
                {
                    key: routeConfig[RouteNameType.AboutPage].path,
                    icon: (): React.ReactNode => <img src={aboutSVG} />,
                    title: t("about-us"),
                    route: routeConfig[RouteNameType.AboutPage].path,
                },
            ],
        });
    }, [pageStore, t]);
    return <div className="user-setting-layout-container">{children}</div>;
};
