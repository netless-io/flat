import React from "react";
import { Story, Meta } from "@storybook/react";
import faker from "faker";

import { CloudStorageFileTitle, CloudStorageFileTitleProps } from "./index";

const storyMeta: Meta = {
    title: "Components/CloudStorageFileTitle",
    component: CloudStorageFileTitle,
};

export default storyMeta;

export const Overview: Story<CloudStorageFileTitleProps> = args => (
    <CloudStorageFileTitle {...args} />
);
Overview.args = {
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
};

const renderFileTitles = (fileType: string, exts: string[]): React.ReactElement => (
    <div className="column is-one-quarter-tablet">
        <div className="box">
            <h1 className="title">{fileType}</h1>
            {exts.map(ext => (
                <div className="flex items-center ma2">
                    <CloudStorageFileTitle
                        key={ext}
                        fileName={faker.random.word() + ext}
                        iconClassName="mr1"
                    />
                </div>
            ))}
        </div>
    </div>
);

export const FileTitles: Story<CloudStorageFileTitleProps> = () => {
    return (
        <div className="columns">
            {renderFileTitles("Office", [".ppt", ".pptx", ".doc", ".docx", ".pdf"])}
            {renderFileTitles("Image", [".jpg", ".png", ".gif", ".jpeg", ".svg", ".bmp", ".eps"])}
            {renderFileTitles("Video", [
                ".mp4",
                ".avi",
                ".mov",
                ".wmv",
                ".3gp",
                ".mkv",
                ".flv",
                ".f4v",
                ".rmvb",
                ".webm",
            ])}
            {renderFileTitles("Audio", [".aac", ".mp3", ".wave", ".wma", ".flac"])}
        </div>
    );
};
FileTitles.argTypes = {
    fileName: { control: false },
    iconClassName: { control: false },
    titleClassName: { control: false },
};
