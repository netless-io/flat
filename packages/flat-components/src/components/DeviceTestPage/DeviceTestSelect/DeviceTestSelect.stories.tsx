import React from "react";
import { Meta, Story } from "@storybook/react";
import { DeviceTestSelect, DeviceTestSelectProps } from ".";

const storyMeta: Meta = {
    title: "DeviceTestPage/DeviceTestSelect",
    component: DeviceTestSelect,
};

export default storyMeta;

export const PlayableExample: Story<DeviceTestSelectProps> = args => (
    <div className="vh-100 mw5-ns">
        <DeviceTestSelect {...args} />
    </div>
);
PlayableExample.args = {
    devices: [
        {
            label: "FaceTime HD Camera",
            deviceId: "1",
        },
        {
            label: "other camera",
            deviceId: "2",
        },
    ],
    isDeviceAccessible: true,
};
