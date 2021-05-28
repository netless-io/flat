import { Meta, Story } from "@storybook/react";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ErrorPage, ErrorPageProps } from ".";

const storyMeta: Meta = {
    title: "ErrorPage/ErrorPage",
    component: ErrorPage,
    parameters: {
        layout: "fullscreen",
    },
};

export default storyMeta;

export const Overview: Story<ErrorPageProps> = args => (
    <Router>
        <ErrorPage {...args} />
    </Router>
);
