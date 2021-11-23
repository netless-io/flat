/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageLayout, MainPageLayoutProps } from ".";
import {
    CloudFilled,
    CloudOutlined,
    HomeFilled,
    HomeOutlined,
    ToolFilled,
    ToolOutlined,
} from "@ant-design/icons";
import faker from "faker";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageLayout",
    component: MainPageLayout,
};

export default storyMeta;

const sideMenuStyles: React.CSSProperties = { fontSize: 25 };

/**
 * TODO: we forget set i18n in current file!!!
 */

export const Overview: Story<PropsWithChildren<MainPageLayoutProps>> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayout {...args} />
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

export const WithSubMenu: Story<MainPageLayoutProps> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayout {...args} />
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

export const LongContent: Story<MainPageLayoutProps> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayout {...args}>
            {Array(300)
                .fill(0)
                .map(() => (
                    <p>{faker.random.words()}</p>
                ))}
        </MainPageLayout>
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
