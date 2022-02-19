import { Meta, Story } from "@storybook/react";
import React from "react";
import { RoomListAllLoaded, RoomListAllLoadedProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/RoomListAllLoaded",
    component: RoomListAllLoaded,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
    },
};

export default storyMeta;

export const Overview: Story<RoomListAllLoadedProps> = () => {
    return <RoomListAllLoaded />;
};
