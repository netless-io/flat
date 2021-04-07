import homeSVG from "../assets/image/home.svg";
import homeActiveSVG from "../assets/image/home-active.svg";
// import userSVG from "../assets/image/user.svg";
// import userActiveSVG from "../assets/image/user-active.svg";
import deviceSVG from "../assets/image/device.svg";
import deviceActiveSVG from "../assets/image/device-active.svg";
import diskSVG from "../assets/image/disk.svg";
import diskActiveSVG from "../assets/image/disk-active.svg";

import React, { useState } from "react";
import { Menu } from "antd";
import { Link, matchPath, useLocation } from "react-router-dom";
import { generateRoutePath, RouteNameType, SettingPageType } from "../utils/routes";
import { routeConfig } from "../route-config";
import "./MainMenu.less";

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
            // {
            //     routeName: RouteNameType.UserInfoPage,
            //     title: "我的",
            //     icon: userSVG,
            //     iconActive: userActiveSVG,
            //     href: generateRoutePath(RouteNameType.UserInfoPage, {}),
            // },
            {
                routeName: RouteNameType.UserSettingPage,
                title: "设置",
                icon: deviceSVG,
                iconActive: deviceActiveSVG, //TODO setting jump router
                href: generateRoutePath(RouteNameType.UserSettingPage, {
                    settingType: SettingPageType.Normal,
                }),
            },
            {
                routeName: RouteNameType.CloudStoragePage,
                title: "云盘",
                icon: diskSVG,
                iconActive: diskActiveSVG,
                href: generateRoutePath(RouteNameType.CloudStoragePage, {}),
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
            {MainMenuItems.map(({ routeName, title, icon, iconActive, href }) =>
                routeName === RouteNameType.UserSettingPage ? null : (
                    <Menu.Item key={routeName}>
                        <Link to={href}>
                            <img
                                width={32}
                                height={32}
                                src={selectedKey === routeName ? iconActive : icon}
                                alt={title}
                                title={title}
                                draggable={false}
                            />
                        </Link>
                    </Menu.Item>
                ),
            )}
            <li className="splitter"></li>
            <Menu.Item key={RouteNameType.UserSettingPage}>
                <Link
                    className="menu-container-bottom-button"
                    to={generateRoutePath(RouteNameType.UserSettingPage, {
                        settingType: SettingPageType.Normal,
                    })}
                >
                    <img
                        width={32}
                        height={32}
                        src={
                            selectedKey === RouteNameType.UserSettingPage
                                ? deviceActiveSVG
                                : deviceSVG
                        }
                        alt={"设备检测"}
                        title={"设备检测"}
                        draggable={false}
                    />
                </Link>
            </Menu.Item>
        </Menu>
    );
});
