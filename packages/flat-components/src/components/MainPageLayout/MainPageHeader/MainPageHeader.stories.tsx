import React from "react";
import { Meta, Story } from "@storybook/react";
import { MainPageHeader, MainPageHeaderProps } from ".";
import { BrowserRouter as Router } from "react-router-dom";

const storyMeta: Meta = {
    title: "MainPageLayout/MainPageHeader",
    component: MainPageHeader,
};

export default storyMeta;

export const Overview: Story<MainPageHeaderProps> = args => (
    <Router>
        <div className="vh-75 mw8-ns">
            <MainPageHeader {...args} />
        </div>
    </Router>
);
Overview.args = {
    title: <span>Example</span>,
};
