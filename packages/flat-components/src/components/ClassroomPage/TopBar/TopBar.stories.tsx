import { Meta, Story } from "@storybook/react";
import React from "react";
import { TopBar, TopBarProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/TopBar",
    component: TopBar,
};

export default storyMeta;

export const Overview: Story<TopBarProps> = args => <TopBar {...args} />;
Overview.args = {
    showWindowsSystemBtn: true,
    left: <span>Hello</span>,
    center: <span>,</span>,
    right: <span>world</span>,
};
