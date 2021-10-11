import React from "react";
import { Meta, Story } from "@storybook/react";
import { CloudStorageSkeletons, CloudStorageSkeletonsProps } from ".";

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageSkeletons",
    component: CloudStorageSkeletons,
};

export default storyMeta;

export const Overview: Story<CloudStorageSkeletonsProps> = args => (
    <CloudStorageSkeletons {...args} />
);
