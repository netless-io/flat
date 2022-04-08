/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageLayoutHorizontal, MainPageLayoutHorizontalProps } from ".";
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
} from "../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageLayoutHorizontal",
    component: MainPageLayoutHorizontal,
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

export const Overview: Story<PropsWithChildren<MainPageLayoutHorizontalProps>> = args => (
    <div className="vh-75 mw8-ns">
        <MainPageLayoutHorizontal {...args} />
    </div>
);
Overview.args = {
    leftMenu: [
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
    rightMenu: [
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
    ],
    popMenu: [
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
