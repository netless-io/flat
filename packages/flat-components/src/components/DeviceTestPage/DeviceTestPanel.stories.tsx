import React from "react";
import { Meta, Story } from "@storybook/react";
import { DeviceTestPanel, DeviceTestPanelProps } from ".";

const storyMeta: Meta = {
    title: "DeviceTestPage/DeviceTestPanel",
    component: DeviceTestPanel,
};

export default storyMeta;

export const PlayableExample: Story<DeviceTestPanelProps> = args => (
    <div className="vh-100 w-70">
        <DeviceTestPanel {...args} />
    </div>
);
PlayableExample.args = {
    cameraDevices: [
        {
            label: "FaceTime HD Camera",
            deviceId: "1",
        },
        {
            label: "other camera",
            deviceId: "2",
        },
    ],
    speakerDevices: [
        {
            label: "default(MacBook Pro speaker)",
            deviceId: "1",
        },
        {
            label: "other speaker",
            deviceId: "2",
        },
    ],
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
    currentCameraDeviceID: "camera",
    currentMicrophoneDeviceID: "microphone",
    microphoneVolume: 21,
    isCameraAccessible: false,
    isMicrophoneAccessible: true,
    isSpeakerAccessible: false,
    speakerTestFileName: "test",
};
