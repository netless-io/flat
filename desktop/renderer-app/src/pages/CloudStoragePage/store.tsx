import { message, Modal } from "antd";
import {
    CloudStorageFile,
    CloudStorageFileName,
    CloudStorageStore as CloudStorageStoreBase,
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
    pickFiles,
    queryTask,
    uploadManager,
} from "./utils";

type FileMenusKey = "download" | "rename" | "delete";

export class CloudStorageStore extends CloudStorageStoreBase {
    pulling = {
        queue: [] as CloudFile[],
        index: 0,
        timer: NaN,
    };

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
            updateFileName: action,
            expandUploadPanel: action,
            onUploadInit: action,
            onUploadEnd: action,
            onUploadError: action,
            onUploadProgress: action,
        });
    }

    expandUploadPanel(): void {
        this.isUploadPanelExpand = true;
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

    onItemMenuClick = async (fileUUID: string, menuKey: React.Key): Promise<void> => {
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
                this.updateFiles({ files: this.files.filter(file => file.fileUUID !== fileUUID) });
                await removeFiles({ fileUUIDs: [fileUUID] });
                await this.refreshFiles();
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

    onBatchDelete = async (): Promise<void> => {
        const fileUUIDs = this.selectedFileUUIDs;
        console.log("[cloud-storage] onBatchDelete", fileUUIDs);
        this.updateFiles({ files: this.files.filter(file => !fileUUIDs.includes(file.fileUUID)) });
        await removeFiles({ fileUUIDs });
        await this.refreshFiles();
    };

    onUploadPanelClose = (): void => {
        for (const { status } of this.uploadStatusesMap.values()) {
            if (status !== "success") {
                message.warning("there are tasks not finished");
                return;
            }
        }
        this.uploadStatusesMap.clear();
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

    onUploadCancel = (fileUUID: string): void => {
        console.log("[cloud-storage] onUploadCancel", fileUUID);
        console.log(`[cloud-storage] TODO: remove zombie task ${fileUUID}`);
        uploadManager.clean([fileUUID]);
        this.uploadStatusesMap.delete(fileUUID);
    };

    setupUpload(file: File): void {
        const task = uploadManager.upload(file);
        task.onInit = fileUUID => {
            console.log("[cloud-storage] start uploading", fileUUID, file.name, file.size);
            this.onUploadInit(fileUUID, file);
        };
        task.onError = error => {
            console.error(error);
            message.error(error.message);
            if (task.fileUUID) {
                this.onUploadError(task.fileUUID, file);
            }
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

    updateFiles({ files, totalUsage }: { files: CloudStorageFile[]; totalUsage?: number }): void {
        this.files = files;
        if (totalUsage) {
            this.totalUsage = totalUsage;
        }
    }

    async initialize(): Promise<void> {
        await this.refreshFiles();
    }

    destroy(): void {
        const { timer } = this.pulling;
        if (!Number.isNaN(timer)) {
            this.pulling.timer = NaN;
            window.clearTimeout(timer);
        }
    }

    async refreshFiles(): Promise<void> {
        const { files, totalUsage } = await listFiles({ page: 1 });
        const tempFiles = files.map(file => ({
            ...file,
            convert: convertStepToType(file.convertStep),
        }));
        const { timer } = this.pulling;
        if (!Number.isNaN(timer)) {
            this.pulling.timer = NaN;
            window.clearTimeout(timer);
        }
        const queue: CloudFile[] = [];
        for (const file of tempFiles) {
            if (file.fileName.endsWith(".pptx") || file.fileName.endsWith(".pdf")) {
                switch (file.convertStep) {
                    case FileConvertStep.None: {
                        console.log("[cloud-storage] convert start", file.fileUUID, file.fileName);
                        const task = await convertStart({ fileUUID: file.fileUUID });
                        file.convertStep = FileConvertStep.Converting;
                        file.convert = "converting";
                        queue.push({ ...file, ...task });
                        break;
                    }
                    case FileConvertStep.Converting: {
                        queue.push(file);
                        break;
                    }
                    default:
                }
            }
        }
        this.updateFiles({
            files: tempFiles,
            totalUsage,
        });
        this.pulling = {
            queue,
            index: 0,
            timer: window.setTimeout(this.pullConvertSteps, 1000),
        };
    }

    pullConvertSteps = async (): Promise<void> => {
        const { queue, index } = this.pulling;
        if (queue.length === 0) return;
        const { fileName, fileUUID, taskUUID, taskToken } = queue[index];
        // TODO: if queryTask failed because of network, retry?
        const { status, progress } = await queryTask(
            taskUUID,
            taskToken,
            fileName.endsWith(".pptx"),
        );
        console.log("[cloud-storage] convert", fileUUID, status, progress?.convertedPercentage);
        switch (status) {
            case "Fail":
            case "Finished": {
                try {
                    await convertFinish({ fileUUID });
                } catch {
                    message.error(`${fileName} convert failed`);
                } finally {
                    await this.refreshFiles();
                }
                break;
            }
            default: {
                this.pulling.index = (index + 1) % queue.length;
                this.pulling.timer = window.setTimeout(this.pullConvertSteps, 1000);
            }
        }
    };
}
