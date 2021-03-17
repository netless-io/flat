import React from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageUploadItem, CloudStorageUploadItemProps } from "./index";
import { CloudStorageFile } from "../types";

const chance = new Chance();

const storyMeta: Meta = {
    title: "Components/CloudStorageUploadItem",
    component: CloudStorageUploadItem,
    argTypes: {
        percent: {
            control: { type: "range", min: 0, max: 100, step: 1 },
        },
    },
};

export default storyMeta;

export const UploadList: Story<CloudStorageUploadItemProps> = ({ onCancel, onRetry }) => {
    function getItem(percent: number, hasError = false): React.ReactElement {
        return (
            <CloudStorageUploadItem
                file={getCloudStorageFile()}
                percent={percent}
                hasError={hasError}
                onCancel={onCancel}
                onRetry={onRetry}
            />
        );
    }

    return (
        <div style={{ width: 336 }}>
            {getItem(20)}
            {getItem(62)}
            {getItem(43, true)}
            {getItem(0)}
            {getItem(0)}
            {getItem(100)}
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
    file: getCloudStorageFile(),
    percent: 0,
    hasError: false,
};

export const Uploading = Template.bind({});
Uploading.args = {
    file: getCloudStorageFile(),
    percent: chance.integer({ min: 1, max: 99 }),
    hasError: false,
};

export const Success = Template.bind({});
Success.args = {
    file: getCloudStorageFile(),
    percent: 100,
    hasError: false,
};

export const Error = Template.bind({});
Error.args = {
    file: getCloudStorageFile(),
    percent: 20,
    hasError: true,
};

function getCloudStorageFile(): CloudStorageFile {
    const chance = new Chance();

    return {
        fileUUID: faker.random.uuid(),
        fileName: faker.random.word() + "." + faker.system.commonFileExt(),
        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
        createAt: faker.date.past(),
    };
}
