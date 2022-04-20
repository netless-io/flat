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
        },
        {
            label: "other camera",
            deviceId: "2",
        },
    ],
    isCameraAccessible: false,
    currentCameraDeviceID: "camera",
};
