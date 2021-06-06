/* eslint-disable react/display-name */
import generalSVG from "./icons/general.svg";
import aboutSVG from "./icons/about.svg";
import hotkeySVG from "./icons/hotkey.svg";
import "./UserSettingLayoutContainer.less";

import React from "react";
import { routeConfig, RouteNameType } from "../../route-config";
import { MainPageLayoutHorizontalContainer } from "../../components/MainPageLayoutHorizontalContainer";

export const UserSettingLayoutContainer: React.FC = ({ children }): React.ReactElement => {
    const subMenu = [
        {
            key: routeConfig[RouteNameType.GeneralSettingPage].path,
            icon: (): React.ReactNode => <img src={generalSVG} />,
            title: "常规设置",
            route: routeConfig[RouteNameType.GeneralSettingPage].path,
        },
        {
            key: routeConfig[RouteNameType.HotKeySettingPage].path,
            icon: (): React.ReactNode => <img src={hotkeySVG} />,
            title: "热键设置",
            route: routeConfig[RouteNameType.HotKeySettingPage].path,
        },
        {
            key: routeConfig[RouteNameType.AboutPage].path,
            icon: (): React.ReactNode => <img src={aboutSVG} />,
            title: "关于我们",
            route: routeConfig[RouteNameType.AboutPage].path,
        },
    ];

    return (
        <MainPageLayoutHorizontalContainer subMenu={subMenu}>
            <div className="user-setting-layout-container">{children}</div>
        </MainPageLayoutHorizontalContainer>
    );
};
