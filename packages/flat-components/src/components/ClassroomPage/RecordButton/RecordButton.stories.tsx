import { Meta, Story } from "@storybook/react";
import faker from "faker";
import React from "react";
import { RecordButton, RecordButtonProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/RecordButton",
    component: RecordButton,
};

export default storyMeta;

export const Overview: Story<RecordButtonProps> = args => <RecordButton {...args} />;
Overview.args = {
    isRecording: faker.datatype.boolean(),
};
