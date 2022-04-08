/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageNavHorizontal, MainPageNavHorizontalProps } from ".";

import {
    SVGCloudFilled,
    SVGCloudOutlined,
    SVGDownload,
    SVGGithub,
    SVGHomeFilled,
    SVGHomeOutlined,
    SVGSetting,
} from "../../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageNavHorizontal",
    component: MainPageNavHorizontal,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

const rightMenuStyles: React.CSSProperties = { fontSize: 22 };
const sideMenuStyles: React.CSSProperties = { fontSize: 25 };

export const Overview: Story<PropsWithChildren<MainPageNavHorizontalProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageNavHorizontal {...args} />
    </div>
);
Overview.args = {
    leftMenu: [
        {
            key: "home",
            icon: active =>
                active ? (
                    <SVGHomeFilled style={sideMenuStyles} />
                ) : (
                    <SVGHomeOutlined style={sideMenuStyles} />
                ),
            title: "首页",
            route: "/home",
        },
        {
            key: "cloudStorage",
            icon: active =>
                active ? (
                    <SVGCloudFilled style={sideMenuStyles} />
                ) : (
                    <SVGCloudOutlined style={sideMenuStyles} />
                ),
            title: "云盘",
            route: "/cloudStorage",
        },
    ],
    rightMenu: [
        {
            key: "download",
            icon: () => <SVGDownload style={rightMenuStyles} />,
            title: "下载",
            route: "/download",
        },
        {
            key: "source-code",
            icon: () => <SVGGithub style={rightMenuStyles} />,
            title: "源码",
            route: "/github",
        },
        {
            key: "userConfig",
            icon: () => <SVGSetting style={rightMenuStyles} />,
            title: "设置",
            route: "/config",
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
    userName: "Flat Name",
    title: <div>Title</div>,
    onBackPreviousPage: () => null,
};
Overview.argTypes = {
    activeKeys: {
        control: {
            type: "multi-select",
            options: ["home", "cloudStorage", "deviceCheck"],
        },
    },
};
