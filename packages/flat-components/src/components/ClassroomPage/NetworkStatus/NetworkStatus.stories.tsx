import React from "react";
import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { NetworkStatus, NetworkStatusProps } from ".";

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
