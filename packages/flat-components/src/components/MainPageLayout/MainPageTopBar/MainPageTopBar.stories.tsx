/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageTopBar, MainPageTopBarProps } from ".";
import { CloudOutlined } from "@ant-design/icons";
import { SVGGithub } from "../../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageTopBar",
    component: MainPageTopBar,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

export const Overview: Story<PropsWithChildren<MainPageTopBarProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageTopBar {...args} />
    </div>
);
Overview.args = {
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
    children: <CloudOutlined />,
    topBarMenu: [
        { key: "github", icon: <SVGGithub />, route: "/github" },
        { key: "home", icon: <CloudOutlined />, route: "/home" },
    ],
    // topBarMenu: [<CloudOutlined />, <CloudOutlined />],
    activeKeys: ["home"],
    avatarSrc: "http://placekitten.com/200/200",
    userName: "Test ultra long user name",
};
Overview.argTypes = {
    activeKeys: {
        control: {
            type: "multi-select",
            options: ["home", "cloudStorage", "deviceCheck"],
        },
    },
};
