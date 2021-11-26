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
    speakerDevices: [
        {
            label: "default(MacBook Pro speaker)",
            deviceId: "1",
            groupId: "1",
            kind: "audioinput",
        },
        {
            label: "other speaker",
            deviceId: "2",
            groupId: "2",
            kind: "audioinput",
        },
    ],
    microphoneDevices: [
        {
            label: "default(MacBook Pro Microphone)",
            deviceId: "1",
            groupId: "1",
            kind: "audioinput",
        },
        {
            label: "other Microphone",
            deviceId: "2",
            groupId: "2",
            kind: "audioinput",
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
