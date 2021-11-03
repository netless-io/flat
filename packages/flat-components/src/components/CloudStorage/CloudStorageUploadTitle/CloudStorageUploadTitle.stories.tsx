import React from "react";
import { Story, Meta } from "@storybook/react";
import faker from "faker";

import { CloudStorageUploadTitle, CloudStorageUploadTitleProps } from "./index";
import { Chance } from "chance";

const chance = new Chance();

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageUploadTitle",
    component: CloudStorageUploadTitle,
};

export default storyMeta;

export const Overview: Story<CloudStorageUploadTitleProps> = args => (
    <CloudStorageUploadTitle {...args} />
);
Overview.args = {
    finishWithError: faker.datatype.boolean(),
    total: chance.integer({ min: 0, max: 200 }),
};
Overview.args.finished = chance.integer({ min: 0, max: Overview.args.total! });

export const Uploading: Story<CloudStorageUploadTitleProps> = args => (
    <CloudStorageUploadTitle {...args} />
);
Uploading.args = {
    finishWithError: false,
    total: chance.integer({ min: 0, max: 200 }),
};
Uploading.args.finished = chance.integer({ min: 0, max: Uploading.args.total! - 1 });

export const Error: Story<CloudStorageUploadTitleProps> = args => (
    <CloudStorageUploadTitle {...args} />
);
Error.args = {
    finishWithError: true,
    total: chance.integer({ min: 0, max: 200 }),
};
Error.args.finished = chance.integer({ min: 0, max: Error.args.total! });

export const Success: Story<CloudStorageUploadTitleProps> = args => (
    <CloudStorageUploadTitle {...args} />
);
Success.args = {
    finishWithError: false,
    total: chance.integer({ min: 0, max: 200 }),
};
Success.args.finished = Success.args.total!;
