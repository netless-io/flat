import { Modal } from "antd";
import {
    CloudStorageConvertStatusType,
    CloudStorageFile as CloudStorageFileUI,
    CloudStorageFileName,
    CloudStorageStore as CloudStorageStoreBase,
    CloudStorageUploadStatusType,
    CloudStorageUploadTask,
    FileUUID,
    UploadID,
} from "flat-components";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import React, { ReactNode } from "react";
import { FileConvertStep } from "../../apiMiddleware/flatServer/constants";
import {
    CloudFile,
    listFiles,
    removeFiles,
    renameFile,
} from "../../apiMiddleware/flatServer/storage";
import { errorTips } from "../../components/Tips/ErrorTips";
import { getUploadTaskManager } from "../../utils/UploadTaskManager";
import { UploadStatusType } from "../../utils/UploadTaskManager/UploadTask";

export type CloudStorageFile = CloudStorageFileUI &
    Pick<CloudFile, "fileURL" | "taskUUID" | "taskToken">;

export type FileMenusKey = "download" | "rename" | "delete";

export class CloudStorageStore extends CloudStorageStoreBase {
    uploadTaskManager = getUploadTaskManager();

    /** User cloud storage files */
    filesMap = observable.map<FileUUID, CloudStorageFile>();

    insertCourseware: (file: CloudStorageFile) => void;

    constructor({
        compact,
        insertCourseware,
    }: {
        compact: boolean;
        insertCourseware: (file: CloudStorageFile) => void;
    }) {
        super();

        this.insertCourseware = insertCourseware;
        this.compact = compact;

        makeObservable(this, {
            filesMap: observable,

            sortedUploadTasks: computed,
            uploadFinishWithError: computed,
            uploadFinishedCount: computed,
            uploadTotalCount: computed,
            files: computed,

            fileMenus: action,
            onItemMenuClick: action,
            onItemTitleClick: action,
            onBatchDelete: action,
            onUpload: action,
            onUploadPanelClose: action,
            onUploadRetry: action,
            onUploadCancel: action,
            onNewFileName: action,
        });
    }

    /** Uploading -> Error -> Idle -> Success */
    get sortedUploadTasks(): CloudStorageUploadTask[] {
        return [
            ...this.uploadTaskManager.uploadingMap.values(),
            ...this.uploadTaskManager.failed,
            ...this.uploadTaskManager.pending,
            ...this.uploadTaskManager.success,
        ].map(uploadTask => ({
            uploadID: uploadTask.uploadID,
            fileName: uploadTask.file.name,
            percent: uploadTask.percent,
            status: this.convertUploadStatus(uploadTask.status),
        }));
    }

    /** If upload finishes with error */
    get uploadFinishWithError(): boolean {
        if (
            this.uploadTaskManager.pending.length > 0 ||
            this.uploadTaskManager.uploadingMap.size > 0
        ) {
            return false;
        }
        return this.uploadTaskManager.failed.length > 0;
    }

    /** Number of finished upload */
    get uploadFinishedCount(): number {
        // @TODO use percentage instead
        return this.uploadTaskManager.success.length;
    }

    /** Number of total upload */
    get uploadTotalCount(): number {
        return this.sortedUploadTasks.length;
    }

    /** User cloud storage files */
    get files(): CloudStorageFileUI[] {
        return [...this.filesMap.values()];
    }

    /** Render file menus item base on fileUUID */
    fileMenus = (file: CloudStorageFileUI): Array<{ key: React.Key; name: React.ReactNode }> => {
        const menus: { key: FileMenusKey; name: ReactNode }[] = [];
        menus.push({ key: "download", name: "下载" });
        if (file.convert !== "error") {
            menus.push({ key: "rename", name: "重命名" });
        }
        menus.push({ key: "delete", name: <span style={{ color: "red" }}>删除</span> });
        return menus;
    };

    /** When a file menus item is clicked */
    onItemMenuClick = (fileUUID: FileUUID, menuKey: React.Key): void => {
        switch (menuKey) {
            case "download": {
                this.downloadFile(fileUUID);
                break;
            }
            case "rename": {
                this.setRenamePanel(fileUUID);
                break;
            }
            case "delete": {
                Modal.confirm({
                    content: "确定删除该课件？课件删除后不可恢复",
                    onOk: () => this.removeFiles([fileUUID]),
                });
                break;
            }
            default: {
                console.warn("[cloud-storage]: unhandled item menu click");
            }
        }
    };

    /** When file title click */
    onItemTitleClick = (fileUUID: FileUUID): void => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            if (this.compact) {
                this.insertCourseware(file);
            } else {
                this.previewCourseware(file);
            }
        }
    };

    /** When page delete button is pressed */
    onBatchDelete = (): void => {
        if (this.selectedFileUUIDs.length > 0) {
            Modal.confirm({
                content: "确定删除所选课件？课件删除后不可恢复",
                onOk: async () => {
                    if (this.selectedFileUUIDs.length > 0) {
                        await this.removeFiles(this.selectedFileUUIDs);
                    }
                },
            });
        }
    };

    /** When upload button is pressed */
    onUpload = async (): Promise<void> => {
        this.setPanelExpand(true);
        try {
            const files = await this.pickCourseware();
            if (files && files.length > 0) {
                this.uploadTaskManager.addTasks(Array.from(files));
            }
        } catch (e) {
            errorTips(e);
        }
    };

    /** When upload panel close button is pressed */
    onUploadPanelClose = (): void => {
        if (
            this.uploadTaskManager.pending.length > 0 ||
            this.uploadTaskManager.uploading.length > 0
        ) {
            Modal.confirm({
                title: "取消上传",
                content: "上传尚未完成，确定取消所有正在进行的上传吗?",
                cancelText: "再想想",
                onOk: () => this.uploadTaskManager.cancelAll(),
            });
        } else {
            this.uploadTaskManager.cancelAll();
        }
    };

    /** Restart uploading a file */
    onUploadRetry = (uploadID: UploadID): void => {
        this.uploadTaskManager.retry(uploadID);
    };

    /** Stop uploading a file */
    onUploadCancel = (uploadID: UploadID): void => {
        this.uploadTaskManager.cancel(uploadID);
    };

    /** When a filename is changed to a meaningful new name */
    onNewFileName = async (
        fileUUID: FileUUID,
        fileNameObject: CloudStorageFileName,
    ): Promise<void> => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            if (file.fileName === fileNameObject.fullName) {
                return;
            } else {
                await renameFile({ fileUUID, fileName: fileNameObject.name });
                runInAction(() => {
                    file.fileName = fileNameObject.fullName;
                });
            }
        }
    };

    initialize(): () => void {
        this.refreshFiles();

        if (
            this.uploadTaskManager.pending.length <= 0 &&
            this.uploadTaskManager.uploadingMap.size <= 0
        ) {
            this.uploadTaskManager.cancelAll();
        }

        const disposer = reaction(
            () => this.sortedUploadTasks.length,
            () => {
                this.refreshFilesDebounced();
            },
        );

        return () => {
            window.clearTimeout(this.refreshFilesTimeout);
            disposer();
        };
    }

    private refreshFilesTimeout = NaN;

    private async refreshFiles(): Promise<void> {
        window.clearTimeout(this.refreshFilesTimeout);

        try {
            const { totalUsage, files: cloudFiles } = await listFiles({ page: 1 });

            runInAction(() => {
                this.totalUsage = totalUsage;

                for (const cloudFile of cloudFiles) {
                    const file = this.filesMap.get(cloudFile.fileUUID);
                    if (file) {
                        file.fileName = cloudFile.fileName;
                        file.createAt = cloudFile.createAt;
                        file.fileSize = cloudFile.fileSize;
                        file.convert = this.mapConvertStep(cloudFile.convertStep);
                        file.taskToken = cloudFile.taskToken;
                        file.taskUUID = cloudFile.taskUUID;
                    } else {
                        this.filesMap.set(cloudFile.fileUUID, {
                            ...cloudFile,
                            convert: this.mapConvertStep(cloudFile.convertStep),
                        });
                    }
                }
            });
        } catch (e) {
            errorTips(e);
        }

        this.refreshFilesDebounced(10 * 1000);
    }

    private refreshFilesDebounced(timeout = 1000): void {
        window.clearTimeout(this.refreshFilesTimeout);
        this.refreshFilesTimeout = window.setTimeout(() => {
            this.refreshFiles();
        }, timeout);
    }

    private previewCourseware(file: CloudStorageFile): void {
        switch (file.convert) {
            case "converting": {
                Modal.info({ content: "课件转码中，请稍后……" });
                return;
            }
            case "error": {
                Modal.info({ content: "转码失败，该课件无法转码" });
                return;
            }
            default: {
                // @TODO preview courseware
                Modal.info({ content: "请到房间内查看课件" });
            }
        }
    }

    private async removeFiles(fileUUIDs: FileUUID[]): Promise<void> {
        try {
            await removeFiles({ fileUUIDs });
            runInAction(() => {
                for (const fileUUID of fileUUIDs) {
                    this.filesMap.delete(fileUUID);
                }
                this.selectedFileUUIDs.clear();
            });
        } catch (e) {
            errorTips(e);
        }
    }

    private downloadFile(fileUUID: FileUUID): void {
        const file = this.filesMap.get(fileUUID);
        if (file && file.fileURL) {
            const a = document.createElement("a");
            a.href = file.fileURL;
            a.click();
        }
    }

    private mapConvertStep(convertStep: FileConvertStep): CloudStorageConvertStatusType {
        switch (convertStep) {
            case FileConvertStep.None: {
                return "idle";
            }
            case FileConvertStep.Failed: {
                return "error";
            }
            case FileConvertStep.Converting: {
                return "converting";
            }
            case FileConvertStep.Done: {
                return "success";
            }
            default: {
                return "idle";
            }
        }
    }

    private pickCourseware(): Promise<FileList | null> {
        return new Promise(resolve => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = ".ppt,.pptx,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif";
            input.onchange = () => resolve(input.files);
            input.click();
        });
    }

    /** convert business upload status to ui upload status type */
    private convertUploadStatus(uploadStatus: UploadStatusType): CloudStorageUploadStatusType {
        switch (uploadStatus) {
            case UploadStatusType.Pending: {
                return "idle";
            }
            case UploadStatusType.Success: {
                return "success";
            }
            case UploadStatusType.Starting:
            case UploadStatusType.Uploading: {
                return "uploading";
            }
            // Failed,
            // Cancelling,
            // Cancelled,
            default: {
                return "error";
            }
        }
    }
}
