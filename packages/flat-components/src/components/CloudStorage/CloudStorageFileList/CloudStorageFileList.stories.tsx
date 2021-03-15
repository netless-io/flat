import React from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageFileList } from "./index";

const chance = new Chance();

const storyMeta: Meta = {
    title: "Components/CloudStorageFileList",
    component: CloudStorageFileList,
    parameters: {
        controls: { expanded: true },
    },
};

export default storyMeta;

export const PlayableList: Story<{ itemCount: number }> = ({ itemCount }) => (
    <CloudStorageFileList
        files={Array(itemCount)
            .fill(0)
            .map(() => {
                return {
                    name: faker.random.words() + "." + faker.system.commonFileExt(),
                    size: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                    createAt: faker.date.past(),
                };
            })}
    />
);
PlayableList.args = {
    itemCount: chance.integer({ min: 0, max: 100 }),
};
PlayableList.argTypes = {
    files: { control: false },
    itemCount: {
        name: "Item Count",
        description: "Number of auto-generated random items",
        control: { type: "range", min: 0, max: 100, step: 1 },
        table: { category: "Showcase" },
    },
};

export const LongFileName: Story<{ fileName: string }> = ({ fileName }) => (
    <CloudStorageFileList
        files={[
            {
                name: fileName,
                size: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                createAt: faker.date.past(),
            },
        ]}
    />
);
LongFileName.args = {
    fileName: faker.random.words(20) + "." + faker.system.commonFileExt(),
};
LongFileName.argTypes = {
    files: { control: false },
    fileName: {
        table: { category: "Showcase" },
    },
};
