/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageLayout, MainPageLayoutProps } from ".";

import faker from "faker";

import {
    SVGCamera,
    SVGCloudFilled,
    SVGCloudOutlined,
    SVGGithub,
    SVGHomeFilled,
    SVGHomeOutlined,
    SVGMicrophone,
    SVGSetting,
    SVGSound,
    SVGSystem,
    SVGTest,
    SVGTestFilled,
} from "../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageLayout",
    component: MainPageLayout,
};

export default storyMeta;

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
            icon: active => (active ? <SVGHomeFilled /> : <SVGHomeOutlined />),
            title: "home",
            route: "/home",
        },
        {
            key: "cloudStorage",
            icon: active => (active ? <SVGCloudFilled /> : <SVGCloudOutlined />),
            title: "cloudStorage",
            route: "/cloudStorage",
        },
    ],
    sideMenuFooter: [
        {
            key: "deviceCheck",
            icon: active => (active ? <SVGTestFilled /> : <SVGTest />),
            title: "deviceCheck",
            route: "/deviceCheck",
        },
    ],
    popMenu: [
        {
            key: "userConfig",
            icon: () => <SVGSetting />,
            title: "个人设置",
            route: "/config",
        },
        {
            key: "getGitHubCode",
            icon: () => <SVGGithub />,
            title: "获取源码",
            route: "/github",
        },
        {
            key: "logout",
            icon: () => <SVGGithub className="red" />,
            title: <span className="red">退出登录</span>,
            route: "/logout",
        },
    ],
    activeKeys: ["home"],
    avatarSrc: "http://placekitten.com/200/200",
    children: <div>content</div>,
    userName: "Flat Name",
    topBarMenu: [
        { key: "github", icon: <SVGGithub />, route: "/github" },
        { key: "home", icon: <SVGHomeOutlined />, route: "/home" },
    ],
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
            icon: () => <SVGSystem />,
            title: "系统检测",
            route: "/device/system",
        },
        {
            key: "cameraTesting",
            icon: () => <SVGCamera />,
            title: "摄像头检测",
            route: "/device/camera",
        },
        {
            key: "speakerTesting",
            icon: () => <SVGSound />,
            title: "扬声器检测",
            route: "/device/speaker",
        },
        {
            key: "microphoneTesting",
            icon: () => <SVGMicrophone />,
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
            icon: () => <SVGSystem />,
            title: "系统检测",
            route: "/device/system",
        },
        {
            key: "cameraTesting",
            icon: () => <SVGCamera />,
            title: "摄像头检测",
            route: "/device/camera",
        },
        {
            key: "speakerTesting",
            icon: () => <SVGSound />,
            title: "扬声器检测",
            route: "/device/speaker",
        },
        {
            key: "microphoneTesting",
            icon: () => <SVGMicrophone />,
            title: "麦克风检测",
            route: "/device/microphone",
        },
    ],
    activeKeys: ["systemTesting"],
};
