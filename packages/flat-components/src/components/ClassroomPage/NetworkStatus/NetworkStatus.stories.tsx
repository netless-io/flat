import { Meta, Story } from "@storybook/react";
import React from "react";
import { NetworkStatus, NetworkStatusProps } from ".";
import faker from "faker";

const storyMeta: Meta = {
    title: "ClassroomPage/NetworkStatus",
    component: NetworkStatus,
};

export default storyMeta;

export const Overview: Story<NetworkStatusProps> = args => <NetworkStatus {...args} />;
Overview.args = {
    networkQuality: {
        delay: faker.datatype.number({ min: 0, max: 1000 }),
        downlink: faker.datatype.number({ min: 0, max: 8 }),
        uplink: faker.datatype.number({ min: 0, max: 8 }),
    },
};
