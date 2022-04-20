/* eslint react/display-name: off */
import { Meta, Story } from "@storybook/react";
import React from "react";
import { WindowsSystemBtn, WindowsSystemBtnProps } from ".";

const storyMeta: Meta = {
    title: "MainPageLayout/WindowsSystemBtn",
    component: WindowsSystemBtn,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

export const Overview: Story<WindowsSystemBtnProps> = args => (
    <div className="vh-100 pa3">
        <WindowsSystemBtn {...args} />
    </div>
);
Overview.args = {
    hiddenMaximizeBtn: true,
};
