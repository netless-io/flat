import React from "react";
import { Meta, Story } from "@storybook/react";
import { MicrophoneTest, MicrophoneTestProps } from ".";

const storyMeta: Meta = {
    title: "DeviceTestPage/MicrophoneTest",
    component: MicrophoneTest,
};

export default storyMeta;

export const PlayableExample: Story<MicrophoneTestProps> = args => (
    <div className="vh-100 mw5-ns">
        <MicrophoneTest {...args} />
    </div>
);
PlayableExample.args = {
    microphoneDevices: [
        {
            label: "default(MacBook Pro Microphone)",
            deviceId: "1",
        },
        {
            label: "other Microphone",
            deviceId: "2",
        },
    ],
    currentMicrophoneDeviceID: "Microphone",
    microphoneVolume: 0.7,
    isMicrophoneAccessible: true,
};
