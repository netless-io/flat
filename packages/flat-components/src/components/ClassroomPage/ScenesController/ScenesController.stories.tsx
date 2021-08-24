import { Meta, Story } from "@storybook/react";
import React from "react";
import { ScenesController, ScenesControllerProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/ScenesController",
    component: ScenesController,
};

export default storyMeta;

export const Overview: Story<ScenesControllerProps> = args => <ScenesController {...args} />;
Overview.args = {
    currentSceneIndex: 1,
    scenesCount: 2,
};
