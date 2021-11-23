/* eslint react/display-name: off */
import generalSVG from "./icons/general.svg";
import aboutSVG from "./icons/about.svg";
import hotkeySVG from "./icons/hotkey.svg";
import "./UserSettingLayoutContainer.less";

import React from "react";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { useWindowSize } from "../../utils/hooks/use-window-size";
import { routeConfig, RouteNameType } from "../../route-config";
import { useTranslation } from "react-i18next";

export const UserSettingLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    const { t } = useTranslation();
    useWindowSize("Main");

    const subMenu = [
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
            key: routeConfig[RouteNameType.AboutPage].path,
            icon: (): React.ReactNode => <img src={aboutSVG} />,
            title: t("about-us"),
            route: routeConfig[RouteNameType.AboutPage].path,
        },
    ];

    return (
        <MainPageLayoutContainer subMenu={subMenu}>
            <div className="user-setting-layout-container">{children}</div>
        </MainPageLayoutContainer>
    );
};
