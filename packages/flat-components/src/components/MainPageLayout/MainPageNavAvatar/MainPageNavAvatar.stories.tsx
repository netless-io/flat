/* eslint-disable react/display-name */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageNavAvatar, MainPageNavAvatarProps } from ".";
import { CloudOutlined } from "@ant-design/icons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageNavAvatar",
    component: MainPageNavAvatar,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

export const Overview: Story<PropsWithChildren<MainPageNavAvatarProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageNavAvatar {...args} />
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
    activeKeys: ["home"],
    avatarSrc: "http://placekitten.com/200/200",
    userName: "Flat Name",
    generateAvatar: () => "http://placekitten.com/64/64",
};
Overview.argTypes = {
    activeKeys: {
        control: {
            type: "multi-select",
            options: ["home", "cloudStorage", "deviceCheck"],
        },
    },
};
