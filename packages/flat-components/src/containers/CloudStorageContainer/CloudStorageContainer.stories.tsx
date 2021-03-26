import React, { useState } from "react";
import { Story, Meta, ArgTypes } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import { action, AnnotationsMap, makeObservable } from "mobx";

import { CloudStorageContainer, CloudStorageStore } from "./index";

const chance = new Chance();

const storyMeta: Meta = {
    title: "CloudStorage/CloudStorageContainer",
    component: CloudStorageContainer,
    argTypes: {
        store: { control: false },
    },
};

export default storyMeta;

const fakeStoreImplProps = [
    "onBatchDelete",
    "onUpload",
    "onUploadCancel",
    "onUploadPanelClose",
    "onUploadRetry",
    "onItemMenuClick",
] as const;

type FakeStoreImplProps = typeof fakeStoreImplProps[number];

type FakeStoreConfig = Pick<CloudStorageStore, FakeStoreImplProps>;

class FakeStore extends CloudStorageStore {
    onBatchDelete;
    onUpload;
    onUploadCancel;
    onUploadPanelClose;
    onUploadRetry;
    onItemMenuClick;

    constructor(config: FakeStoreConfig) {
        super();

        this.onBatchDelete = config.onBatchDelete;
        this.onUpload = config.onUpload;
        this.onUploadCancel = config.onUploadCancel;
        this.onUploadPanelClose = config.onUploadPanelClose;
        this.onUploadRetry = config.onUploadRetry;
        this.onItemMenuClick = config.onItemMenuClick;

        makeObservable(
            this,
            fakeStoreImplProps.reduce((o, k) => {
                o[k] = action;
                return o;
            }, {} as AnnotationsMap<this, never>),
        );
    }

    fileMenus = (): Array<{ key: React.Key; name: React.ReactNode }> => [
        { key: "download", name: "下载" },
        { key: "rename", name: "重命名" },
        { key: "delete", name: <span className="red">删除</span> },
    ];
}

function createFakeStore(config: FakeStoreConfig): FakeStore {
    const store = new FakeStore(config);
    store.totalUsage = chance.integer({ min: 0, max: 1000 * 1000 * 1000 });
    store.files = Array(25)
        .fill(0)
        .map(() => {
            return {
                fileUUID: faker.random.uuid(),
                fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                createAt: faker.date.past(),
            };
        });

    for (let i = chance.integer({ min: 0, max: 200 }); i >= 0; i--) {
        const fileUUID = faker.random.uuid();
        store.uploadStatusesMap.set(fileUUID, {
            fileUUID,
            fileName: faker.random.word() + "." + faker.system.commonFileExt(),
            status: chance.pickone(["idle", "error", "success", "uploading"]),
            percent: chance.integer({ min: 0, max: 100 }),
        });
    }
    return store;
}

function fakeStoreArgTypes(): ArgTypes {
    return fakeStoreImplProps.reduce((o, k) => {
        o[k] = { table: { disable: true } };
        return o;
    }, {} as ArgTypes);
}

export const Overview: Story<FakeStoreConfig> = config => {
    const [store] = useState(() => createFakeStore(config));
    return (
        <div className="ba br3 b--light-gray" style={{ height: 600, maxHeight: "80vh" }}>
            <CloudStorageContainer store={store} />
        </div>
    );
};
Overview.argTypes = fakeStoreArgTypes();

export const CompactMode: Story<FakeStoreConfig> = config => {
    const [store] = useState(() => {
        const store = createFakeStore(config);
        store.compact = true;
        return store;
    });
    return (
        <div className="ba br3 b--light-gray" style={{ height: 600, maxHeight: "80vh" }}>
            <CloudStorageContainer store={store} />
        </div>
    );
};
CompactMode.argTypes = fakeStoreArgTypes();
