import React, { useEffect, useMemo, useState } from "react";
import { Story, Meta } from "@storybook/react";
import Chance from "chance";
import faker from "faker";

import { CloudStorageUploadPanel, CloudStorageUploadPanelProps } from "./index";
import { CloudStorageUploadStatus } from "../types";
import CloudStorageUploadItem from "../CloudStorageUploadItem";

const chance = new Chance();

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageUploadPanel",
    component: CloudStorageUploadPanel,
};

export default storyMeta;

export const Overview: Story<CloudStorageUploadPanelProps> = args => (
    <CloudStorageUploadPanel {...args}>
        {String(args.children)
            .split("\n")
            .map(line => (
                <p className="ma1">{line}</p>
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
    const uploadStatuses = useUploadStatusList(props.total);
    const [expand, setExpand] = useState(false);
    return (
        <CloudStorageUploadPanel {...props} expand={expand} onExpandChange={setExpand}>
            {uploadStatuses.map(status => (
                <CloudStorageUploadItem
                    {...status}
                    key={status.fileUUID}
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

function useUploadStatusList(count: number): CloudStorageUploadStatus[] {
    const [statuses, setStatuses] = useState(() => getUploadStatuses(count));

    useEffect(() => {
        setStatuses(statuses => {
            if (count > statuses.length) {
                return [...statuses, ...getUploadStatuses(count - statuses.length)];
            } else if (count < statuses.length) {
                return statuses.slice(0, count);
            }
            return statuses;
        });
    }, [count]);

    return statuses;
}

function getUploadStatuses(count: number): CloudStorageUploadStatus[] {
    return Array(count)
        .fill(0)
        .map(() => ({
            fileUUID: faker.random.uuid(),
            fileName: faker.random.word() + "." + faker.system.commonFileExt(),
            hasError: false,
            percent: chance.integer({ min: 0, max: 100 }),
        }));
}
