import React from "react";
import { Meta, Story } from "@storybook/react";
import { SpeakerTest, SpeakerTestProps } from ".";

const storyMeta: Meta = {
    title: "DeviceTestPage/SpeakerTest",
    component: SpeakerTest,
};

export default storyMeta;

export const PlayableExample: Story<SpeakerTestProps> = args => (
    <div className="vh-100 mw5-ns">
        <SpeakerTest {...args} />
    </div>
);
PlayableExample.args = {
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
    currentSpeakerDeviceID: "speaker",
    isSpeakerAccessible: true,
    speakerTestFileName: "test",
};
