import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomListEmpty, RoomListEmptyProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListEmpty",
    component: RoomListEmpty,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
    },
};

export default storyMeta;

export const Overview: Story<RoomListEmptyProps> = ({ isHistory }) => {
    return <RoomListEmpty isHistory={isHistory} />;
};
Overview.args = {
    isHistory: false,
};
