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
    fileUUID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
};

export const Converting: Story<CloudStorageFileTitleProps> = args => (
    <CloudStorageFileTitle {...args} />
);
Converting.args = {
    fileUUID: faker.datatype.uuid(),
    fileName: faker.random.word() + ".pptx",
    convertStatus: "converting",
};

export const ConvertError: Story<CloudStorageFileTitleProps> = args => (
    <CloudStorageFileTitle {...args} />
);
ConvertError.args = {
    fileUUID: faker.datatype.uuid(),
    fileName: faker.random.word() + ".doc",
    convertStatus: "error",
};

export const Rename: Story<CloudStorageFileTitleProps> = args => (
    <CloudStorageFileTitle {...args} />
);
Rename.args = {
    fileUUID: faker.datatype.uuid(),
    fileName: faker.random.word() + ".doc",
    convertStatus: "success",
};
Rename.args.renamingFileUUID = Rename.args.fileUUID;

export const FileTitles: Story<CloudStorageFileTitleProps> = ({ onTitleClick }) => {
    const renderFileTitles = (fileType: string, exts: string[]): React.ReactElement => (
        <div className="column">
            <div className="box">
                <h1 className="title">{fileType}</h1>
                {exts.map(ext => (
                    <div className="flex items-center ma2">
                        <CloudStorageFileTitle
                            key={ext}
                            fileUUID={faker.datatype.uuid()}
                            fileName={faker.random.word() + ext}
                            onTitleClick={onTitleClick}
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
            {renderFileTitles("HTML5 Courseware", [".ice", ".vf"])}
        </div>
    );
};
FileTitles.argTypes = {
    fileName: { control: false },
    iconClassName: { control: false },
    titleClassName: { control: false },
};
