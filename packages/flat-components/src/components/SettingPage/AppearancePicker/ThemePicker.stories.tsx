import React from "react";
import { Meta, Story } from "@storybook/react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppearancePicker, AppearancePickerProps } from ".";

const storyMeta: Meta = {
    title: "SettingPage/AppearancePicker",
    component: AppearancePicker,
};

export default storyMeta;

export const Overview: Story<AppearancePickerProps> = args => (
    <Router>
        <div className="vh-75 mw8-ns">
            <AppearancePicker {...args} />
        </div>
    </Router>
);
Overview.args = {
    value: "light",
};
