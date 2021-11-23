import React, { useMemo, useState } from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageFileList, CloudStorageFileListProps } from "./index";
import { CloudStorageFile } from "../types";

const chance = new Chance();

/**
 * TODO: we forget set i18n in current file!!!
 */

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageFileList",
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
                fileUUID: faker.datatype.uuid(),
                fileName: faker.random.word() + "." + faker.system.commonFileExt(),
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                convert: chance.pickone(["idle", "error", "success", "converting"]),
                createAt: faker.date.past(),
            };
        }),
};
Overview.args.selectedFileUUIDs = [Overview.args.files![1].fileUUID];
Overview.args.fileMenus = () => [
    { key: "download", name: "下载" },
    { key: "rename", name: "重命名" },
    { key: "delete", name: "删除" },
];

export const LongFileName: Story<{ fileName: string } & CloudStorageFileListProps> = ({
    fileName,
    onSelectionChange,
    ...restProps
}) => {
    const [selectedFileUUIDs, setSelectedFileUUIDs] = useState<string[]>([]);
    const files = useMemo<CloudStorageFile[]>(
        () => [
            {
                fileUUID: faker.datatype.uuid(),
                fileName,
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                convert: chance.pickone(["idle", "error", "success", "converting"]),
                createAt: faker.date.past(),
            },
        ],
        [fileName],
    );
    return (
        <CloudStorageFileList
            {...restProps}
            files={files}
            selectedFileUUIDs={selectedFileUUIDs}
            onSelectionChange={keys => {
                setSelectedFileUUIDs(keys);
                onSelectionChange(keys);
            }}
            fileMenus={() => [
                { key: "download", name: "下载" },
                { key: "rename", name: "重命名" },
                { key: "delete", name: "删除" },
            ]}
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
LongFileName.parameters = {
    viewport: {
        defaultViewport: "tablet2",
    },
};

export const EmptyFile: Story<CloudStorageFileListProps> = args => (
    <div className="vh-75">
        <CloudStorageFileList {...args} />
    </div>
);
EmptyFile.args = {
    files: [],
};
EmptyFile.argTypes = {
    files: {
        control: false,
    },
};

export const PlayableExample: Story<{ itemCount: number } & CloudStorageFileListProps> = ({
    itemCount,
    onSelectionChange,
    ...restProps
}) => {
    const [selectedFileUUIDs, setSelectedFileUUIDs] = useState<string[]>([]);
    const files = useMemo<CloudStorageFile[]>(
        () =>
            Array(itemCount)
                .fill(0)
                .map(() => {
                    return {
                        fileUUID: faker.datatype.uuid(),
                        fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                        convert: chance.pickone(["idle", "error", "success", "converting"]),
                        createAt: faker.date.past(),
                    };
                }),
        [itemCount],
    );
    return (
        <CloudStorageFileList
            {...restProps}
            files={files}
            selectedFileUUIDs={selectedFileUUIDs}
            onSelectionChange={keys => {
                setSelectedFileUUIDs(keys);
                onSelectionChange(keys);
            }}
            fileMenus={() => [
                { key: "download", name: "下载" },
                { key: "rename", name: "重命名" },
                { key: "delete", name: <span className="red">删除</span> },
            ]}
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
