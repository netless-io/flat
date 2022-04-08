/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageNavAvatar, MainPageNavAvatarProps } from ".";

import { SVGGithub, SVGSetting } from "../../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageNavAvatar",
    component: MainPageNavAvatar,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

/**
 * TODO: we forget set i18n in current file!!!
 */

export const Overview: Story<PropsWithChildren<MainPageNavAvatarProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageNavAvatar {...args} />
    </div>
);
Overview.args = {
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
