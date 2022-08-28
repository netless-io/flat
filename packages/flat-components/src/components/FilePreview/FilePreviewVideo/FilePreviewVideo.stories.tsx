import React from "react";
import { Meta, Story } from "@storybook/react";
import { randomCloudFile } from "../../../utils/storybook";
import { FilePreviewVideo, FilePreviewVideoProps } from ".";

const storyMeta: Meta = {
    title: "FilePreview/FilePreviewVideo",
    component: FilePreviewVideo,
};

export default storyMeta;

export const Overview: Story<FilePreviewVideoProps> = () => {
    return (
        <div className="vh-75">
            <FilePreviewVideo
                file={randomCloudFile({
                    fileName: "test.mp4",
                    fileURL:
                        "https://flat-storage.oss-accelerate.aliyuncs.com/cloud-storage/2022-03/28/e35a6676-aa5d-4a61-8f17-87e626b7d1b7/e35a6676-aa5d-4a61-8f17-87e626b7d1b7.mp4",
                })}
            />
        </div>
    );
};
