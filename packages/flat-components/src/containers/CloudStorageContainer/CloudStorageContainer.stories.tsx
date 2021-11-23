import React, { useState } from "react";
import { Story, Meta, ArgTypes } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import { action, AnnotationsMap, makeObservable } from "mobx";
import { Modal } from "antd";
import { CloudStorageContainer, CloudStorageStore } from "./index";
import { CloudStorageUploadTask } from "../../components/CloudStorage/types";

const chance = new Chance();

/**
 * TODO: we forget set i18n in current file!!!
 */

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
    "onItemTitleClick",
    "onNewFileName",
    "addExternalFile",
] as const;

type FakeStoreImplProps = typeof fakeStoreImplProps[number];

type FakeStoreConfig = Pick<CloudStorageStore, FakeStoreImplProps>;

class FakeStore extends CloudStorageStore {
    public onBatchDelete;
    public onUpload;
    public onUploadCancel;
    public onUploadPanelClose;
    public onUploadRetry;
    public onItemMenuClick: FakeStoreConfig["onItemMenuClick"];
    public onItemTitleClick;
    public onNewFileName: FakeStoreConfig["onNewFileName"];
    public addExternalFile;

    public pendingUploadTasks: CloudStorageStore["pendingUploadTasks"] = [];
    public uploadingUploadTasks: CloudStorageStore["uploadingUploadTasks"] = [];
    public successUploadTasks: CloudStorageStore["successUploadTasks"] = [];
    public failedUploadTasks: CloudStorageStore["failedUploadTasks"] = [];
    public files: CloudStorageStore["files"] = [];

    public constructor(config: FakeStoreConfig) {
        super();

        this.files = Array(25)
            .fill(0)
            .map(() => ({
                fileUUID: faker.datatype.uuid(),
                fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                convert: chance.pickone(["idle", "error", "success", "converting"]),
                createAt: faker.date.past(),
            }));

        this.totalUsage = this.files.reduce((sum, file) => sum + file.fileSize, 0);

        for (let i = chance.integer({ min: 0, max: 200 }); i >= 0; i--) {
            const fileUUID = faker.datatype.uuid();

            const task: CloudStorageUploadTask = {
                uploadID: fileUUID,
                fileName: faker.random.word() + "." + faker.system.commonFileExt(),
                status: chance.pickone(["idle", "error", "success", "uploading"]),
                percent: chance.integer({ min: 0, max: 100 }),
            };
            switch (task.status) {
                case "idle": {
                    this.pendingUploadTasks.push(task);
                    break;
                }
                case "error": {
                    this.failedUploadTasks.push(task);
                    break;
                }
                case "success": {
                    this.successUploadTasks.push(task);
                    break;
                }
                case "uploading": {
                    this.uploadingUploadTasks.push(task);
                    break;
                }
                default: {
                    break;
                }
            }
        }

        this.onBatchDelete = config.onBatchDelete;
        this.onUpload = config.onUpload;
        this.onUploadCancel = config.onUploadCancel;
        this.onUploadPanelClose = config.onUploadPanelClose;
        this.onUploadRetry = config.onUploadRetry;
        this.addExternalFile = config.addExternalFile;
        this.onItemMenuClick = (fileUUID, menuKey) => {
            switch (menuKey) {
                case "download": {
                    const file = this.files.find(file => file.fileUUID === fileUUID);
                    Modal.info({ content: `Fake download file "${file?.fileName}".` });
                    break;
                }
                case "rename": {
                    this.setRenamePanel(fileUUID);
                    break;
                }
                case "delete": {
                    const index = this.files.findIndex(file => file.fileUUID === fileUUID);
                    if (index >= 0) {
                        this.files.splice(index, 1);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
            config.onItemMenuClick(fileUUID, menuKey);
        };
        this.onItemTitleClick = config.onItemTitleClick;
        this.onNewFileName = (fileUUID, fileName) => {
            const file = this.files.find(file => file.fileUUID === fileUUID);
            if (file) {
                file.fileName = fileName.fullName;
            }
            config.onNewFileName(fileUUID, fileName);
        };

        makeObservable(
            this,
            fakeStoreImplProps.reduce((o, k) => {
                o[k] = action;
                return o;
            }, {} as AnnotationsMap<this, never>),
        );
    }

    public fileMenus = (): Array<{ key: React.Key; name: React.ReactNode }> => [
        { key: "download", name: "下载" },
        { key: "rename", name: "重命名" },
        { key: "delete", name: <span className="red">删除</span> },
    ];
}

function fakeStoreArgTypes(): ArgTypes {
    return fakeStoreImplProps.reduce((o, k) => {
        o[k] = { table: { disable: true }, action: k };
        return o;
    }, {} as ArgTypes);
}

export const Overview: Story<FakeStoreConfig> = config => {
    const [store] = useState(() => new FakeStore(config));
    return (
        <div className="ba br3 b--light-gray" style={{ height: 600, maxHeight: "80vh" }}>
            <CloudStorageContainer store={store} />
        </div>
    );
};
Overview.argTypes = fakeStoreArgTypes();

export const CompactMode: Story<FakeStoreConfig> = config => {
    const [store] = useState(() => {
        const store = new FakeStore(config);
        store.compact = true;
        return store;
    });
    return (
        <div className="ba br3 b--light-gray" style={{ height: "400px" }}>
            <CloudStorageContainer store={store} />
        </div>
    );
};
CompactMode.argTypes = fakeStoreArgTypes();
CompactMode.parameters = {
    viewport: {
        viewports: {
            compact: {
                name: "Compact Mode",
                styles: { width: "640px", height: "432px" },
            },
        },
        defaultViewport: "compact",
    },
};
