import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { LoadingPage, LoadingPageProps } from ".";

const storyMeta: Meta = {
    title: "LoadingPage/LoadingPage",
    component: LoadingPage,
};

export default storyMeta;

export const Overview: Story<LoadingPageProps> = args => (
    <Router>
        <LoadingPage {...args} />
    </Router>
);
Overview.args = {
    text: faker.random.words(),
};
