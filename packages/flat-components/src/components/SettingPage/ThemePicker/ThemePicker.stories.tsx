import React from "react";
import { Meta, Story } from "@storybook/react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemePicker, ThemePickerProps } from ".";

const storyMeta: Meta = {
    title: "SettingPage/ThemePicker",
    component: ThemePicker,
};

export default storyMeta;

export const Overview: Story<ThemePickerProps> = args => (
    <Router>
        <div className="vh-75 mw8-ns">
            <ThemePicker {...args} />
        </div>
    </Router>
);
Overview.args = {
    defaultValue: "light",
};
