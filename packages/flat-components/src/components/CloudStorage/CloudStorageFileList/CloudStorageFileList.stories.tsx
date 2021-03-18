import React, { useMemo, useState } from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageFileList, CloudStorageFileListProps } from "./index";

const chance = new Chance();

const storyMeta: Meta = {
    title: "Components/CloudStorageFileList",
    component: CloudStorageFileList,
};

export default storyMeta;

export const Overview: Story<CloudStorageFileListProps> = args => (
    <CloudStorageFileList {...args} />
);

Overview.args = {
    files: Array(3)
        .fill(0)
        .map(() => {
            return {
                fileUUID: faker.random.uuid(),
                fileName: faker.random.word() + "." + faker.system.commonFileExt(),
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                createAt: faker.date.past(),
            };
        }),
};
Overview.args.selectedFileUUIDs = [Overview.args.files![1].fileUUID];

export const LongFileName: Story<{ fileName: string } & CloudStorageFileListProps> = ({
    fileName,
    onSelectionChange,
}) => {
    const [selectedFileUUIDs, setSelectedFileUUIDs] = useState<string[]>([]);
    const files = useMemo(
        () => [
            {
                fileUUID: faker.random.uuid(),
                fileName,
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                createAt: faker.date.past(),
            },
        ],
        [fileName],
    );
    return (
        <CloudStorageFileList
            files={files}
            selectedFileUUIDs={selectedFileUUIDs}
            onSelectionChange={keys => {
                setSelectedFileUUIDs(keys);
                onSelectionChange(keys);
            }}
        />
    );
};
LongFileName.args = {
    fileName: faker.random.words(20) + "." + faker.system.commonFileExt(),
};
LongFileName.argTypes = {
    files: { control: false },
    selectedFileUUIDs: { control: false },
    fileName: {
        table: { category: "Showcase" },
    },
};

export const PlayableExample: Story<{ itemCount: number } & CloudStorageFileListProps> = ({
    itemCount,
    onSelectionChange,
}) => {
    const [selectedFileUUIDs, setSelectedFileUUIDs] = useState<string[]>([]);
    const files = useMemo(
        () =>
            Array(itemCount)
                .fill(0)
                .map(() => {
                    return {
                        fileUUID: faker.random.uuid(),
                        fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                        createAt: faker.date.past(),
                    };
                }),
        [itemCount],
    );
    return (
        <CloudStorageFileList
            files={files}
            selectedFileUUIDs={selectedFileUUIDs}
            onSelectionChange={keys => {
                setSelectedFileUUIDs(keys);
                onSelectionChange(keys);
            }}
        />
    );
};
PlayableExample.args = {
    itemCount: chance.integer({ min: 0, max: 100 }),
};
PlayableExample.argTypes = {
    files: { control: false },
    selectedFileUUIDs: { control: false },
    itemCount: {
        name: "Item Count",
        description: "Number of auto-generated random items",
        control: { type: "range", min: 0, max: 100, step: 1 },
        table: { category: "Showcase" },
    },
};
