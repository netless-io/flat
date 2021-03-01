import homeSVG from "../assets/image/home.svg";
import homeActiveSVG from "../assets/image/home-active.svg";
import userSVG from "../assets/image/user.svg";
import userActiveSVG from "../assets/image/user-active.svg";
import settingSVG from "../assets/image/setting.svg";
import settingActiveSVG from "../assets/image/setting-active.svg";

import React, { useState } from "react";
import { Menu } from "antd";
import { Link, matchPath, useLocation } from "react-router-dom";
import { generateRoutePath, RouteNameType, SettingPageType } from "../utils/routes";
import { routeConfig } from "../route-config";

export interface MainMenuProps {}

export const MainMenu = React.memo<MainMenuProps>(function MainMenu() {
    const location = useLocation();

    const [MainMenuItems] = useState(() =>
        Object.freeze([
            {
                routeName: RouteNameType.HomePage,
                title: "首页",
                icon: homeSVG,
                iconActive: homeActiveSVG,
                href: generateRoutePath(RouteNameType.HomePage, {}),
            },
            {
                routeName: RouteNameType.UserInfoPage,
                title: "我的",
                icon: userSVG,
                iconActive: userActiveSVG,
                href: generateRoutePath(RouteNameType.UserInfoPage, { testParams: "success" }),
            },
            {
                routeName: RouteNameType.UserSettingPage,
                title: "设置",
                icon: settingSVG,
                iconActive: settingActiveSVG,
                href: generateRoutePath(RouteNameType.UserSettingPage, {
                    settingType: SettingPageType.Normal,
                }),
            },
        ]),
    );

    const selectedKey =
        MainMenuItems.find(({ routeName }) =>
            matchPath(location.pathname, {
                path: routeConfig[routeName].path,
                exact: true,
            }),
        )?.routeName || RouteNameType.HomePage;

    return (
        <Menu className="menu-container" defaultSelectedKeys={[selectedKey]}>
            {MainMenuItems.map(({ routeName, title, icon, iconActive, href }) => (
                <Menu.Item
                    icon={
                        <img
                            width={44}
                            height={44}
                            src={selectedKey === routeName ? iconActive : icon}
                            alt={title}
                        />
                    }
                    key={routeName}
                >
                    <Link to={href}>
                        <span>{title}</span>
                    </Link>
                </Menu.Item>
            ))}
        </Menu>
    );
});
