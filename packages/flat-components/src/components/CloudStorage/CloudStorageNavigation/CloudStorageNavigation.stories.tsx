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
    path: "/my cloud storage/new directory/cheer ego/project/video/",
    pushHistory: () => {
        console.log("click");
    },
};
