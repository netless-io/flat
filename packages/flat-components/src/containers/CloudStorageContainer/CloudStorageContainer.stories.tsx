import React, { useState } from "react";
import { Story, Meta, ArgTypes } from "@storybook/react";
import Chance from "chance";
import faker from "faker";
import { action, AnnotationsMap, makeObservable, observable } from "mobx";
import { Modal } from "antd";
import { CloudStorageContainer, CloudStorageStore } from "./index";
import { CloudStorageUploadTask } from "../../components/CloudStorage/types";
import { FileConvertStep, FileResourceType, Region } from "@netless/flat-server-api";

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
    "onNewEmptyDirectory",
    "onNewDirectoryFile",
    "onParentDirectoryPathClick",
    "onDropFile",
    "fetchMoreCloudStorageData",
] as const;

type FakeStoreImplProps = (typeof fakeStoreImplProps)[number];

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
    public onNewEmptyDirectory: FakeStoreConfig["onNewEmptyDirectory"];
    public onNewDirectoryFile: FakeStoreConfig["onNewDirectoryFile"];
    public onParentDirectoryPathClick: FakeStoreConfig["onParentDirectoryPathClick"];
    public onDropFile: FakeStoreConfig["onDropFile"];
    public fetchMoreCloudStorageData;

    public pendingUploadTasks: CloudStorageStore["pendingUploadTasks"] = [];
    public uploadingUploadTasks: CloudStorageStore["uploadingUploadTasks"] = [];
    public successUploadTasks: CloudStorageStore["successUploadTasks"] = [];
    public failedUploadTasks: CloudStorageStore["failedUploadTasks"] = [];
    public files: CloudStorageStore["files"] = [];

    public constructor(config: FakeStoreConfig) {
        super();

        this.files = Array(this.cloudStorageSinglePageFiles)
            .fill(0)
            .map(() => ({
                fileUUID: faker.datatype.uuid(),
                fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                createAt: faker.date.past(),
                fileURL: faker.internet.url(),
                external: faker.datatype.boolean(),
                resourceType: FileResourceType.NormalResources,
                meta: {
                    whiteboardProjector: {
                        taskToken: faker.random.word(),
                        taskUUID: faker.random.word(),
                        convertStep: chance.pickone([
                            FileConvertStep.None,
                            FileConvertStep.Converting,
                            FileConvertStep.Done,
                            FileConvertStep.Failed,
                        ]),
                        region: Region.CN_HZ,
                    },
                },
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
        this.onItemMenuClick = (fileUUID, menuKey, pushHistory) => {
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
            config.onItemMenuClick(fileUUID, menuKey, pushHistory);
        };
        this.onItemTitleClick = config.onItemTitleClick;
        this.onNewFileName = (fileUUID, fileName) => {
            const file = this.files.find(file => file.fileUUID === fileUUID);
            if (file) {
                file.fileName = fileName.fullName;
            }
            config.onNewFileName(fileUUID, fileName);
        };
        this.onNewEmptyDirectory = config.onNewEmptyDirectory;
        this.onParentDirectoryPathClick = config.onParentDirectoryPathClick;
        this.onNewDirectoryFile = config.onNewDirectoryFile;
        this.onDropFile = files => {
            for (const file of files) {
                this.files.push({
                    fileUUID: faker.datatype.uuid(),
                    fileName: file.name,
                    fileSize: file.size,
                    createAt: faker.date.past(),
                    fileURL: faker.internet.url(),
                    resourceType: FileResourceType.NormalResources,
                    meta: {
                        whiteboardProjector: {
                            taskToken: faker.random.word(),
                            taskUUID: faker.random.word(),
                            convertStep: chance.pickone([
                                FileConvertStep.None,
                                FileConvertStep.Converting,
                                FileConvertStep.Done,
                                FileConvertStep.Failed,
                            ]),
                            region: Region.CN_HZ,
                        },
                    },
                });
            }
        };
        this.fetchMoreCloudStorageData = async (page: number): Promise<void> => {
            if (this.isFetchingFiles || this.files.length > 300) {
                console.warn("the cloud storage files is enough");
                return Promise.resolve();
            }

            const cloudStorageTotalPagesFilesCount =
                this.cloudStorageDataPagination * this.cloudStorageSinglePageFiles;

            if (this.files.length >= cloudStorageTotalPagesFilesCount) {
                this.isFetchingFiles = true;

                const newFilesData = Array(this.cloudStorageSinglePageFiles * page)
                    .fill(0)
                    .map(() => ({
                        fileUUID: faker.datatype.uuid(),
                        fileName: faker.random.words() + "." + faker.system.commonFileExt(),
                        fileSize: chance.integer({ min: 0, max: 1000 * 1000 * 100 }),
                        convert: chance.pickone(["idle", "error", "success", "converting"]),
                        createAt: faker.date.past(),
                    }));

                for (const { fileName, fileSize } of newFilesData) {
                    this.files.push({
                        fileUUID: faker.datatype.uuid(),
                        fileName: fileName,
                        fileSize: fileSize,
                        createAt: faker.date.past(),
                        fileURL: faker.internet.url(),
                        resourceType: FileResourceType.NormalResources,
                        meta: {
                            whiteboardProjector: {
                                taskToken: faker.random.word(),
                                taskUUID: faker.random.word(),
                                convertStep: chance.pickone([
                                    FileConvertStep.None,
                                    FileConvertStep.Converting,
                                    FileConvertStep.Done,
                                    FileConvertStep.Failed,
                                ]),
                                region: Region.CN_HZ,
                            },
                        },
                    });
                }

                this.isFetchingFiles = false;
            }
        };

        makeObservable(
            this,
            fakeStoreImplProps.reduce(
                (o, k) => {
                    o[k] = action;
                    return o;
                },
                {
                    files: observable,
                } as AnnotationsMap<this, never>,
            ),
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
        <div className="ba br3 b--gray overflow-hidden" style={{ height: 600, maxHeight: "80vh" }}>
            <CloudStorageContainer
                path={"/path/to/directory/"}
                pushHistory={(): void => {
                    console.log("click push history");
                }}
                store={store}
            />
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
        <div className="ba br3 b--gray overflow-hidden" style={{ height: "400px" }}>
            <CloudStorageContainer
                path={"/path/to/directory/"}
                pushHistory={(): void => {
                    console.log("click push history");
                }}
                store={store}
            />
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
