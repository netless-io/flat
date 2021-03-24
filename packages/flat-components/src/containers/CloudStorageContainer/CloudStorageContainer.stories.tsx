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
] as const;

type FakeStoreImplProps = typeof fakeStoreImplProps[number];

type FakeStoreConfig = Pick<CloudStorageStore, FakeStoreImplProps>;

class FakeStore extends CloudStorageStore {
    onBatchDelete;
    onUpload;
    onUploadCancel;
    onUploadPanelClose;
    onUploadRetry;

    constructor(config: FakeStoreConfig) {
        super();

        this.onBatchDelete = config.onBatchDelete;
        this.onUpload = config.onUpload;
        this.onUploadCancel = config.onUploadCancel;
        this.onUploadPanelClose = config.onUploadPanelClose;
        this.onUploadRetry = config.onUploadRetry;

        makeObservable(
            this,
            fakeStoreImplProps.reduce((o, k) => {
                o[k] = action;
                return o;
            }, {} as AnnotationsMap<this, never>),
        );
    }
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
    store.uploadTotalCount = chance.integer({ min: 0, max: 200 });
    store.uploadFinishedCount = chance.integer({ min: 0, max: store.uploadTotalCount });
    store.uploadStatuses = Array(store.uploadTotalCount)
        .fill(0)
        .map(() => ({
            fileUUID: faker.random.uuid(),
            fileName: faker.random.word() + "." + faker.system.commonFileExt(),
            status: chance.pickone(["idle", "error", "success", "uploading"]),
            percent: chance.integer({ min: 0, max: 100 }),
        }));
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
