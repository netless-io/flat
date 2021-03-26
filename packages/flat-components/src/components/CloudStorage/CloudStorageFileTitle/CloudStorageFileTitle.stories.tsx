import React from "react";
import { Story, Meta } from "@storybook/react";
import faker from "faker";

import { CloudStorageFileTitle, CloudStorageFileTitleProps } from "./index";

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageFileTitle",
    component: CloudStorageFileTitle,
};

export default storyMeta;

export const Overview: Story<CloudStorageFileTitleProps> = args => (
    <CloudStorageFileTitle {...args} />
);
Overview.args = {
    fileUUID: faker.random.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
};

export const FileTitles: Story<CloudStorageFileTitleProps> = ({ titleClickable, onClick }) => {
    const renderFileTitles = (fileType: string, exts: string[]): React.ReactElement => (
        <div className="column is-one-quarter-tablet">
            <div className="box">
                <h1 className="title">{fileType}</h1>
                {exts.map(ext => (
                    <div className="flex items-center ma2">
                        <CloudStorageFileTitle
                            key={ext}
                            fileUUID={faker.random.uuid()}
                            fileName={faker.random.word() + ext}
                            iconClassName="mr1"
                            titleClickable={titleClickable}
                            onClick={onClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

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
