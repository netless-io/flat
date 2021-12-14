import React from "react";
import { Meta, Story } from "@storybook/react";
import { RaiseHand, RaiseHandProps } from ".";
import faker from "faker";

const storyMeta: Meta = {
    title: "ClassroomPage/RaiseHand",
    component: RaiseHand,
};

export default storyMeta;

export const Overview: Story<RaiseHandProps> = args => (
    <div style={{ height: "48px", width: "48px" }}>
        <RaiseHand {...args} />
    </div>
);
Overview.args = {
    disableHandRaising: false,
    isRaiseHand: faker.datatype.boolean(),
};
