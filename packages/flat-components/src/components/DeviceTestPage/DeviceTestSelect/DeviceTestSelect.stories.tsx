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
            groupId: "1",
            kind: "audioinput",
        },
        {
            label: "other camera",
            deviceId: "2",
            groupId: "2",
            kind: "audioinput",
        },
    ],
    isDeviceAccessible: true,
};
