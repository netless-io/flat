import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";
import { CloudRecordBtn, CloudRecordBtnProps } from ".";

const storyMeta: Meta = {
    title: "ClassroomPage/CloudRecordBtn",
    component: CloudRecordBtn,
};

export default storyMeta;

export const Overview: Story<CloudRecordBtnProps> = () => {
    const [isRecording, updateRecording] = useState<boolean>(false);
    return (
        <CloudRecordBtn
            isRecording={isRecording}
            onClick={() => {
                updateRecording(!isRecording);
            }}
        />
    );
};
