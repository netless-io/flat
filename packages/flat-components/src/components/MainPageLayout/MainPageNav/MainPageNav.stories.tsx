/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React, { PropsWithChildren } from "react";
import { MainPageNav, MainPageNavProps } from ".";

import {
    SVGCloudFilled,
    SVGCloudOutlined,
    SVGHomeFilled,
    SVGHomeOutlined,
    SVGTest,
    SVGTestFilled,
} from "../../FlatIcons";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageNav",
    component: MainPageNav,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

export const Overview: Story<PropsWithChildren<MainPageNavProps>> = args => (
    <div className="vh-100 pa3">
        <MainPageNav {...args} />
    </div>
);
Overview.args = {
    sideMenu: [
        {
            key: "home",
            title: "home",
            route: "/home",
            icon: (active: boolean): React.ReactNode => {
                return active ? <SVGHomeFilled /> : <SVGHomeOutlined />;
            },
        },
        {
            key: "cloudStorage",
            title: "cloudStorage",
            route: "/cloudStorage",
            icon: (active: boolean): React.ReactNode => {
                return active ? <SVGCloudFilled /> : <SVGCloudOutlined />;
            },
        },
    ],
    sideMenuFooter: [
        {
            key: "deviceCheck",
            title: "deviceCheck",
            route: "/deviceCheck",
            icon: (active: boolean): React.ReactNode => {
                return active ? <SVGTestFilled /> : <SVGTest />;
            },
        },
    ],
    activeKeys: ["home"],
};
Overview.argTypes = {
    activeKeys: {
        control: {
            type: "multi-select",
            options: ["home", "cloudStorage", "deviceCheck"],
        },
    },
};
