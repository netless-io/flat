/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageNav, MainPageNavProps } from ".";
import {
    CloudFilled,
    CloudOutlined,
    HomeFilled,
    HomeOutlined,
    ToolFilled,
    ToolOutlined,
} from "@ant-design/icons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageNav",
    component: MainPageNav,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

const sideMenuStyles: React.CSSProperties = { fontSize: 25 };

export const Overview: Story<PropsWithChildren<MainPageNavProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageNav {...args} />
    </div>
);
Overview.args = {
    sideMenu: [
        {
            key: "home",
            icon: active =>
                active ? (
                    <HomeFilled style={sideMenuStyles} />
                ) : (
                    <HomeOutlined style={sideMenuStyles} />
                ),
            title: "home",
            route: "/home",
        },
        {
            key: "cloudStorage",
            icon: active =>
                active ? (
                    <CloudFilled style={sideMenuStyles} />
                ) : (
                    <CloudOutlined style={sideMenuStyles} />
                ),
            title: "cloudStorage",
            route: "/cloudStorage",
        },
    ],
    sideMenuFooter: [
        {
            key: "deviceCheck",
            icon: active =>
                active ? (
                    <ToolFilled style={sideMenuStyles} />
                ) : (
                    <ToolOutlined style={sideMenuStyles} />
                ),
            title: "deviceCheck",
            route: "/deviceCheck",
        },
    ],
    popMenu: [
        {
            key: "userConfig",
            icon: () => <CloudOutlined />,
            title: "个人设置",
            route: "/config",
        },
        {
            key: "getGitHubCode",
            icon: () => <CloudOutlined />,
            title: "获取源码",
            route: "/github",
        },
        {
            key: "logout",
            icon: () => <CloudOutlined className="red" />,
            title: <span className="red">退出登录</span>,
            route: "/logout",
        },
    ],
    activeKeys: ["home"],
    avatarSrc: "http://placekitten.com/200/200",
    userName: "Flat Name",
};
Overview.argTypes = {
    activeKeys: {
        control: {
            type: "multi-select",
            options: ["home", "cloudStorage", "deviceCheck"],
        },
    },
};
