/* eslint-disable react/display-name */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageLayoutHorizontal, MainPageLayoutHorizontalProps } from ".";
import {
    CloudFilled,
    CloudOutlined,
    HomeFilled,
    HomeOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import faker from "faker";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageLayoutHorizontal",
    component: MainPageLayoutHorizontal,
};

export default storyMeta;

const sideMenuStyles: React.CSSProperties = { fontSize: 25 };

export const Overview: Story<PropsWithChildren<MainPageLayoutHorizontalProps>> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayoutHorizontal {...args} />
    </div>
);
Overview.args = {
    leftMenu: [
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
    rightMenu: [
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
    ],
    popMenu: [
        {
            key: "logout",
            icon: () => <CloudOutlined className="red" />,
            title: <span className="red">退出登录</span>,
            route: "/logout",
        },
    ],
    activeKeys: ["home"],
    avatarSrc: "http://placekitten.com/200/200",
    children: <div>content</div>,
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

export const WithSubMenu: Story<MainPageLayoutHorizontalProps> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayoutHorizontal {...args} />
    </div>
);
WithSubMenu.args = {
    ...Overview.args,
    subMenu: [
        {
            key: "systemTesting",
            icon: () => <ToolOutlined />,
            title: "系统检测",
            route: "/device/system",
        },
        {
            key: "cameraTesting",
            icon: () => <CloudOutlined />,
            title: "摄像头检测",
            route: "/device/camera",
        },
        {
            key: "speakerTesting",
            icon: () => <CloudOutlined />,
            title: "扬声器检测",
            route: "/device/speaker",
        },
        {
            key: "microphoneTesting",
            icon: () => <CloudOutlined />,
            title: "麦克风检测",
            route: "/device/microphone",
        },
    ],
    activeKeys: ["systemTesting"],
};

export const LongContent: Story<MainPageLayoutHorizontalProps> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayoutHorizontal {...args}>
            {Array(300)
                .fill(0)
                .map(() => (
                    <p>{faker.random.words()}</p>
                ))}
        </MainPageLayoutHorizontal>
    </div>
);
LongContent.args = {
    ...Overview.args,
    subMenu: [
        {
            key: "systemTesting",
            icon: () => <ToolOutlined />,
            title: "系统检测",
            route: "/device/system",
        },
        {
            key: "cameraTesting",
            icon: () => <CloudOutlined />,
            title: "摄像头检测",
            route: "/device/camera",
        },
        {
            key: "speakerTesting",
            icon: () => <CloudOutlined />,
            title: "扬声器检测",
            route: "/device/speaker",
        },
        {
            key: "microphoneTesting",
            icon: () => <CloudOutlined />,
            title: "麦克风检测",
            route: "/device/microphone",
        },
    ],
    activeKeys: ["systemTesting"],
};
