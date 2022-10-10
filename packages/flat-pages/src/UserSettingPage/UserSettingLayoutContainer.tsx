import "./UserSettingLayoutContainer.less";

import React, { useContext, useEffect } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { SVGApps, SVGCircleInfoOutlined, SVGCode, SVGGeneral, SVGShortcut } from "flat-components";
import { routeConfig, RouteNameType } from "../route-config";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext } from "../components/StoreProvider";
import { observer } from "mobx-react-lite";

export const UserSettingLayoutContainer: React.FC = observer(function UserSettingLayoutContainer({
    children,
}) {
    useLoginCheck();
    const t = useTranslate();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            subMenu: [
                {
                    key: routeConfig[RouteNameType.GeneralSettingPage].path,
                    icon: (active): React.ReactNode => <SVGGeneral active={active} />,
                    title: t("general-settings"),
                    route: routeConfig[RouteNameType.GeneralSettingPage].path,
                },
                {
                    key: routeConfig[RouteNameType.HotKeySettingPage].path,
                    icon: (active): React.ReactNode => <SVGShortcut active={active} />,
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
                    icon: (active): React.ReactNode => <SVGCircleInfoOutlined active={active} />,
                    title: t("about-us"),
                    route: routeConfig[RouteNameType.AboutPage].path,
                },
            ],
        });
    }, [pageStore, t]);

    return <div className="user-setting-layout-container">{children}</div>;
});
