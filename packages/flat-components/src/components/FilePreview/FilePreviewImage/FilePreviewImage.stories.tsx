import { Meta, Story } from "@storybook/react";
import React from "react";
import { randomCloudFile } from "../../../utils/storybook";
import { FilePreviewImage, FilePreviewImageProps } from ".";

const storyMeta: Meta = {
    title: "FilePreview/FilePreviewImage",
    component: FilePreviewImage,
};

export default storyMeta;

export const Overview: Story<FilePreviewImageProps> = () => {
    return (
        <FilePreviewImage
            file={randomCloudFile({
                fileName: "test.png",
                fileURL: "http://placekitten.com/g/200/300",
            })}
        />
    );
};
