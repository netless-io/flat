import { message, Modal } from "antd";
import {
    CloudStorageFile,
    CloudStorageFileName,
    CloudStorageStore as CloudStorageStoreBase,
    CloudStorageUploadStatus,
} from "flat-components";
import { action, makeObservable } from "mobx";
import React, { ReactNode } from "react";
import { FileConvertStep } from "../../apiMiddleware/flatServer/constants";
import {
    CloudFile,
    convertFinish,
    convertStart,
    listFiles,
    removeFiles,
    renameFile,
} from "../../apiMiddleware/flatServer/storage";
import {
    convertStepToType,
    download,
    getFileUrl,
    isFakeID,
    pickFiles,
    queryTask,
    uploadManager,
} from "./utils";

type FileMenusKey = "download" | "rename" | "delete";

export class CloudStorageStore extends CloudStorageStoreBase {
    pulling = new Map<string, number>();
    retryable = new Map<string, File>();

    fileMenus = (
        file: CloudStorageFile,
        _index: number,
    ): { key: FileMenusKey; name: ReactNode }[] => {
        const menus: { key: FileMenusKey; name: ReactNode }[] = [];
        menus.push({ key: "download", name: "下载" });
        if (file.convert !== "error") {
            menus.push({ key: "rename", name: "重命名" });
        }
        menus.push({ key: "delete", name: <span style={{ color: "red" }}>删除</span> });
        return menus;
    };

    constructor(compact: boolean) {
        super();
        this.setCompact(compact);
        makeObservable(this, {
            updateFiles: action,
            updateTotalUsage: action,
            updateFileName: action,
            expandUploadPanel: action,
            clearUploadStatusesMap: action,
            deleteFileFromUploadStatusesMap: action,
            onUploadInit: action,
            onUploadEnd: action,
            onUploadError: action,
            onUploadProgress: action,
            unselectAll: action,
        });
    }

    unselectAll(): void {
        this.selectedFileUUIDs = [];
    }

    expandUploadPanel(): void {
        this.isUploadPanelExpand = true;
    }

    clearUploadStatusesMap(): void {
        this.uploadStatusesMap.clear();
    }

    deleteFileFromUploadStatusesMap(fileUUID: string): void {
        this.uploadStatusesMap.delete(fileUUID);
    }

    onUpload = async (): Promise<void> => {
        this.expandUploadPanel();
        const files = await pickFiles({
            multiple: true,
            accept: ".ppt,.pptx,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif",
        });
        if (!files || files.length === 0) return;
        for (const file of Array.from(files)) {
            this.setupUpload(file);
        }
    };

    onItemMenuClick = (fileUUID: string, menuKey: React.Key): void => {
        const key = menuKey as FileMenusKey;
        console.log("[cloud-storage] onItemMenuClick", fileUUID, key);
        switch (key) {
            case "download": {
                const { fileName } = this.files.find(file => file.fileUUID === fileUUID)!;
                download(getFileUrl(fileName, fileUUID));
                break;
            }
            case "rename": {
                this.setRenamePanel(fileUUID);
                break;
            }
            case "delete": {
                Modal.confirm({
                    content: "确定删除所选课件？课件删除后不可恢复",
                    onOk: async () => {
                        this.updateFiles(this.files.filter(file => file.fileUUID !== fileUUID));
                        await removeFiles({ fileUUIDs: [fileUUID] });
                        await this.refreshFiles();
                        this.unselectAll();
                    },
                });
                break;
            }
            default:
        }
    };

    updateFileName(file: CloudStorageFile, fileName: string): void {
        file.fileName = fileName;
    }

    async onNewFileName(
        fileUUID: string,
        { fullName: fileName }: CloudStorageFileName,
    ): Promise<void> {
        const file = this.files.find(file => file.fileUUID === fileUUID);
        if (file) {
            if (file.fileName === fileName) {
                return;
            } else {
                this.updateFileName(file, fileName);
                await renameFile({ fileUUID, fileName });
                await this.refreshFiles();
            }
        }
    }

    onItemTitleClick = (fileUUID: string): void => {
        console.log("[cloud-storage] onItemTitleClick", fileUUID);
        const file = this.files.find(file => file.fileUUID === fileUUID);
        switch (file?.convert) {
            case "converting": {
                Modal.info({ content: "课件转码中，请稍后……" });
                return;
            }
            case "error": {
                Modal.info({ content: "转码失败，该课件无法转码" });
                return;
            }
            default: {
                Modal.info({ content: "请到房间内查看课件" });
            }
        }
    };

    onBatchDelete = (): void => {
        Modal.confirm({
            content: "确定删除所选课件？课件删除后不可恢复",
            onOk: async () => {
                const fileUUIDs = this.selectedFileUUIDs;
                console.log("[cloud-storage] onBatchDelete", fileUUIDs);
                this.updateFiles(this.files.filter(file => !fileUUIDs.includes(file.fileUUID)));
                await removeFiles({ fileUUIDs });
                await this.refreshFiles();
                this.unselectAll();
            },
        });
    };

    isUploadNotFinished = ({ status }: CloudStorageUploadStatus): boolean => {
        return status !== "success" && status !== "error";
    };

    onUploadPanelClose = (): void => {
        if (Array.from(this.uploadStatusesMap.values()).some(this.isUploadNotFinished)) {
            Modal.confirm({
                title: "取消上传",
                content: "上传尚未完成，确定取消所有正在进行的上传吗?",
                cancelText: "再想想",
                onOk: () => {
                    this.clearUploadStatusesMap();
                },
            });
        } else {
            this.clearUploadStatusesMap();
        }
    };

    onUploadRetry = (fileUUID: string): void => {
        console.log("[cloud-storage] onUploadRetry", fileUUID);
        const file = this.retryable.get(fileUUID);
        if (file) {
            this.retryable.delete(fileUUID);
            this.setupUpload(file);
        } else {
            console.log("[cloud-storage] can not retry such file", fileUUID);
        }
    };

    onUploadCancel = async (fileUUID: string): Promise<void> => {
        console.log("[cloud-storage] onUploadCancel", fileUUID);
        uploadManager.clean([fileUUID]);
        this.deleteFileFromUploadStatusesMap(fileUUID);
        await this.refreshFiles();
    };

    setupUpload(file: File): void {
        const task = uploadManager.upload(file);
        const { fileUUID: fakeID } = task;
        this.onUploadInit(fakeID, file);
        task.onInit = fileUUID => {
            console.log("[cloud-storage] start uploading", fileUUID, file.name, file.size);
            this.deleteFileFromUploadStatusesMap(fakeID);
            this.onUploadInit(fileUUID, file);
            this.refreshFiles();
        };
        task.onError = error => {
            console.error(error);
            message.error(error.message);
            if (!isFakeID(task.fileUUID)) {
                this.onUploadError(task.fileUUID, file);
                this.refreshFiles();
            }
        };
        task.onCancel = () => {
            this.refreshFiles();
        };
        task.onEnd = () => {
            console.log("[cloud-storage] finish uploading", task.fileUUID);
            this.onUploadEnd(task.fileUUID);
            this.refreshFiles();
        };
        task.onProgress = e => {
            this.onUploadProgress(task.fileUUID, file, e);
        };
    }

    onUploadProgress(fileUUID: string, file: File, e: ProgressEvent): void {
        this.uploadStatusesMap.set(fileUUID, {
            fileUUID: fileUUID,
            fileName: file.name,
            percent: ((100 * e.loaded) / e.total) | 0,
            status: "uploading",
        });
    }

    onUploadEnd(fileUUID: string): void {
        const status = this.uploadStatusesMap.get(fileUUID);
        if (status) {
            status.status = "success";
        }
    }

    onUploadError(fileUUID: string, file: File): void {
        const status = this.uploadStatusesMap.get(fileUUID);
        if (status) {
            this.retryable.set(fileUUID, file);
            status.status = "error";
        }
    }

    onUploadInit(fileUUID: string, file: File): void {
        this.uploadStatusesMap.set(fileUUID, {
            fileUUID,
            fileName: file.name,
            percent: 0,
            status: "idle",
        });
    }

    updateFiles(files: CloudStorageFile[]): void {
        this.files = files;
    }

    updateTotalUsage(totalUsage: number): void {
        this.totalUsage = totalUsage;
    }

    async initialize(): Promise<void> {
        await this.refreshFiles();
    }

    destroy(): void {
        this.clearPullingTasks();
    }

    clearPullingTasks(): void {
        for (const timer of this.pulling.values()) {
            window.clearTimeout(timer);
        }
        this.pulling.clear();
    }

    async refreshFiles(): Promise<void> {
        this.clearPullingTasks();
        const { files, totalUsage } = await listFiles({ page: 1 });
        const tempFiles = files.map(file => ({
            ...file,
            convert: convertStepToType(file.convertStep),
        }));
        for (const file of tempFiles) {
            if (file.fileName.endsWith(".pptx") || file.fileName.endsWith(".pdf")) {
                let shouldPull = false;
                if (file.convertStep === FileConvertStep.None) {
                    try {
                        console.log("[cloud-storage] convert start", file.fileUUID, file.fileName);
                        const { taskToken, taskUUID } = await convertStart({
                            fileUUID: file.fileUUID,
                        });
                        file.convertStep = FileConvertStep.Converting;
                        file.convert = "converting";
                        file.taskToken = taskToken;
                        file.taskUUID = taskUUID;
                        shouldPull = true;
                    } catch {
                        // ignore convert start failed
                    }
                } else if (file.convertStep === FileConvertStep.Converting) {
                    shouldPull = true;
                }
                if (shouldPull) {
                    this.setupPullingFile(file);
                }
            }
        }
        this.updateFiles(tempFiles);
        this.updateTotalUsage(totalUsage === 0 ? NaN : totalUsage);
    }

    setupPullingFile({ fileName, fileUUID, taskUUID, taskToken }: CloudFile): void {
        let task: () => Promise<void>;
        const next = (): void => {
            const timer = this.pulling.get(fileUUID);
            if (timer) {
                window.clearTimeout(timer);
            }
            this.pulling.set(fileUUID, window.setTimeout(task, 1000));
        };
        task = async (): Promise<void> => {
            const { status, progress } = await queryTask(
                taskUUID,
                taskToken,
                fileName.endsWith(".pptx"),
            );
            console.log(
                "[cloud-storage] convert",
                fileUUID,
                fileName,
                status,
                progress?.convertedPercentage,
            );
            switch (status) {
                case "Fail":
                case "Finished": {
                    try {
                        await convertFinish({ fileUUID });
                    } catch (e) {
                        if (status === "Fail") {
                            message.error(`${fileName} convert failed`);
                        }
                    } finally {
                        await this.refreshFiles();
                    }
                    break;
                }
                default: {
                    next();
                }
            }
        };
        next();
    }
}
