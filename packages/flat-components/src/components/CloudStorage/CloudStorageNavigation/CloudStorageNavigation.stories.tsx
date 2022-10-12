import React from "react";
import { Meta, Story } from "@storybook/react";
import { CloudStorageNavigation, CloudStorageNavigationProps } from ".";

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageNavigation",
    component: CloudStorageNavigation,
};

export default storyMeta;

export const Overview: Story<CloudStorageNavigationProps> = args => (
    <CloudStorageNavigation {...args} />
);
Overview.args = {
    path: "/cloud/path/to/video",
    pushHistory: () => {
        console.log("click");
    },
};
