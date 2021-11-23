import React, { useEffect, useState } from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageUploadPanel, CloudStorageUploadPanelProps } from "./index";
import { CloudStorageUploadTask } from "../types";
import CloudStorageUploadItem from "../CloudStorageUploadItem";

const chance = new Chance();

/**
 * TODO: we forget set i18n in current file!!!
 */

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageUploadPanel",
    component: CloudStorageUploadPanel,
};

export default storyMeta;

export const Overview: Story<CloudStorageUploadPanelProps> = args => (
    <CloudStorageUploadPanel {...args}>
        {String(args.children)
            .split("\n")
            .map((line, i) => (
                <p className="pv1" key={i}>
                    {line}
                </p>
            ))}
    </CloudStorageUploadPanel>
);
Overview.args = {
    title: "传输列表",
    expand: true,
    total: chance.integer({ min: 0, max: 200 }),
    children: "Example Content",
};
Overview.args.finished = chance.integer({ min: 0, max: Overview.args.total });
Overview.argTypes = {
    children: {
        description: "Child elements",
        control: "text",
        table: { category: "Showcase" },
    },
};

interface PlayableExampleArgs extends CloudStorageUploadPanelProps {
    onRetry: (fileUUID: string) => void;
    onCancel: (fileUUID: string) => void;
}
export const PlayableExample: Story<PlayableExampleArgs> = ({ onRetry, onCancel, ...props }) => {
    const uploadTasks = useUploadTasksList(props.total);
    const [expand, setExpand] = useState(false);
    return (
        <CloudStorageUploadPanel {...props} expand={expand} onExpandChange={setExpand}>
            {uploadTasks.map(status => (
                <CloudStorageUploadItem
                    {...status}
                    key={status.uploadID}
                    onRetry={onRetry}
                    onCancel={onCancel}
                />
            ))}
        </CloudStorageUploadPanel>
    );
};
PlayableExample.args = {
    expand: true,
    total: chance.integer({ min: 0, max: 200 }),
};
PlayableExample.args.finished = chance.integer({ min: 0, max: PlayableExample.args.total });
PlayableExample.argTypes = {
    expand: { control: false },
    finished: { control: { type: "range", min: 0, max: 200, step: 1 } },
    total: { control: { type: "range", min: 0, max: 200, step: 1 } },
    onRetry: {
        action: "onRetry",
        table: { disable: true },
    },
    onCancel: {
        action: "onCancel",
        table: { disable: true },
    },
};

function useUploadTasksList(count: number): CloudStorageUploadTask[] {
    const [statuses, setStatuses] = useState(() => getUploadTasks(count));

    useEffect(() => {
        setStatuses(statuses => {
            if (count > statuses.length) {
                return [...statuses, ...getUploadTasks(count - statuses.length)];
            } else if (count < statuses.length) {
                return statuses.slice(0, count);
            }
            return statuses;
        });
    }, [count]);

    return statuses;
}

function getUploadTasks(count: number): CloudStorageUploadTask[] {
    return Array(count)
        .fill(0)
        .map(() => ({
            uploadID: faker.datatype.uuid(),
            fileName: faker.random.word() + "." + faker.system.commonFileExt(),
            status: "uploading",
            percent: chance.integer({ min: 0, max: 100 }),
        }));
}
