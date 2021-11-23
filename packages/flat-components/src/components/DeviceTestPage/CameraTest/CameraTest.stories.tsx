import React from "react";
import { Meta, Story } from "@storybook/react";
import { CameraTest, CameraTestProps } from ".";

const storyMeta: Meta = {
    title: "DeviceTestPage/CameraTest",
    component: CameraTest,
};

export default storyMeta;

export const PlayableExample: Story<CameraTestProps> = args => (
    <div className="vh-100 mw5-ns">
        <CameraTest {...args} />
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
    isCameraAccessible: false,
    currentCameraDeviceID: "camera",
};
