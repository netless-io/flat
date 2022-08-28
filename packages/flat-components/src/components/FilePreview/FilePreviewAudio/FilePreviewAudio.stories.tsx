import { Meta, Story } from "@storybook/react";
import React from "react";
import { randomCloudFile } from "../../../utils/storybook";
import { FilePreviewAudio, FilePreviewAudioProps } from ".";

const storyMeta: Meta = {
    title: "FilePreview/FilePreviewAudio",
    component: FilePreviewAudio,
};

export default storyMeta;

export const Overview: Story<FilePreviewAudioProps> = () => {
    return (
        <div className="vh-75">
            <FilePreviewAudio
                file={randomCloudFile({
                    fileName: "test.mp3",
                    fileURL:
                        "https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/28/f663cdcc-3367-4a15-8d2d-65fa4302c782/f663cdcc-3367-4a15-8d2d-65fa4302c782.mp3",
                })}
            />
        </div>
    );
};
