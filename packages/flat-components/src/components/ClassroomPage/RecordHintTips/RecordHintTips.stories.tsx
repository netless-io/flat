import { Meta, Story } from "@storybook/react";
import React from "react";
import { RecordHintTips, RecordHintTipsProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/RecordHintTips",
    component: RecordHintTips,
};

export default storyMeta;

export const Overview: Story<RecordHintTipsProps> = args => (
    <RecordHintTips {...args}>
        <div className="pa2 ba">hello, world!</div>
    </RecordHintTips>
);
