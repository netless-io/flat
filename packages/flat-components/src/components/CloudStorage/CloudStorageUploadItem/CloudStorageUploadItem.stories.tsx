import React from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageUploadItem, CloudStorageUploadItemProps } from "./index";
import { CloudStorageUploadStatusType } from "../types";

const chance = new Chance();

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageUploadItem",
    component: CloudStorageUploadItem,
    argTypes: {
        percent: {
            control: { type: "range", min: 0, max: 100, step: 1 },
        },
    },
};

export default storyMeta;

export const Overview: Story<CloudStorageUploadItemProps> = args => (
    <CloudStorageUploadItem {...args} />
);
Overview.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
    percent: chance.integer({ min: 0, max: 100 }),
    status: chance.pickone(["idle", "error", "success", "uploading"]),
};

export const LongFileName: Story<CloudStorageUploadItemProps> = args => (
    <CloudStorageUploadItem {...args} />
);
LongFileName.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.words(20) + "." + faker.system.commonFileExt(),
    percent: chance.integer({ min: 0, max: 100 }),
    status: chance.pickone(["idle", "error", "success", "uploading"]),
};
LongFileName.parameters = {
    viewport: {
        defaultViewport: "mobile2",
    },
};

export const UploadList: Story<CloudStorageUploadItemProps> = ({ onCancel, onRetry }) => {
    function getItem(
        percent: number,
        status: CloudStorageUploadStatusType = "uploading",
    ): React.ReactElement {
        return (
            <CloudStorageUploadItem
                uploadID={faker.datatype.uuid()}
                fileName={faker.random.word() + "." + faker.system.commonFileExt()}
                percent={percent}
                status={status}
                onCancel={onCancel}
                onRetry={onRetry}
            />
        );
    }

    return (
        <div style={{ width: 336 }}>
            {getItem(20)}
            {getItem(62)}
            {getItem(43, "error")}
            {getItem(0, "idle")}
            {getItem(0)}
            {getItem(100, "success")}
            {getItem(100)}
        </div>
    );
};
UploadList.argTypes = {
    file: { control: false },
    percent: { control: false },
    hasError: { control: false },
};

const Template: Story<CloudStorageUploadItemProps> = props => {
    return (
        <div style={{ width: 336 }}>
            <CloudStorageUploadItem {...props} />
        </div>
    );
};

export const Pending = Template.bind({});
Pending.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
    percent: 0,
    status: "idle",
};

export const Uploading = Template.bind({});
Uploading.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
    percent: chance.integer({ min: 1, max: 99 }),
    status: "uploading",
};

export const Success = Template.bind({});
Success.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
    percent: 100,
    status: "success",
};

export const Error = Template.bind({});
Error.args = {
    uploadID: faker.datatype.uuid(),
    fileName: faker.random.word() + "." + faker.system.commonFileExt(),
    percent: 20,
    status: "error",
};
