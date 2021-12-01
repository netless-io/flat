import "./store.less";
import closeSVG from "./image/close.svg";

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
import type { i18n } from "i18next";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import React, { ReactNode } from "react";
import {
    ConvertingTaskStatus,
    queryConvertingTaskStatus,
} from "../../api-middleware/courseware-converting";
import { FileConvertStep } from "../../api-middleware/flatServer/constants";
import {
    addExternalFile,
    CloudFile,
    convertFinish,
    convertStart,
    listFiles,
    removeFiles,
    removeExternalFiles,
    renameFile,
    renameExternalFile,
} from "../../api-middleware/flatServer/storage";
import { errorTips } from "../../components/Tips/ErrorTips";
import { getCoursewarePreloader } from "../../utils/courseware-preloader";
import { getUploadTaskManager } from "../../utils/upload-task-manager";
import { UploadStatusType, UploadTask } from "../../utils/upload-task-manager/upload-task";
import { fileInfo, ResourcePreview } from "./CloudStorageFilePreview";
import { getFileExt, isPPTX } from "../../utils/file";
import { ConvertStatusManager } from "./ConvertStatusManager";
import { queryH5ConvertingStatus } from "../../api-middleware/h5-converting";

export type CloudStorageFile = CloudStorageFileUI &
    Pick<CloudFile, "fileURL" | "taskUUID" | "taskToken" | "region" | "external">;

export type FileMenusKey = "open" | "download" | "rename" | "delete";

export class CloudStorageStore extends CloudStorageStoreBase {
    public uploadTaskManager = getUploadTaskManager();

    /** User cloud storage files */
    public filesMap = observable.map<FileUUID, CloudStorageFile>();

    public insertCourseware: (file: CloudStorageFile) => void;
    public onCoursewareInserted?: () => void;

    // a set of taskUUIDs representing querying tasks
    private convertStatusManager = new ConvertStatusManager();

    private i18n: i18n;

    public constructor({
        compact,
        insertCourseware,
        i18n,
    }: {
        compact: boolean;
        insertCourseware: (file: CloudStorageFile) => void;
        i18n: i18n;
    }) {
        super();

        this.insertCourseware = insertCourseware;
        this.compact = compact;
        this.i18n = i18n;

        makeObservable(this, {
            filesMap: observable,

            pendingUploadTasks: computed,
            uploadingUploadTasks: computed,
            successUploadTasks: computed,
            failedUploadTasks: computed,
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

    public get pendingUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.pending);
    }

    public get uploadingUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.uploading);
    }

    public get successUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.success);
    }

    public get failedUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.failed);
    }

    /** User cloud storage files */
    public get files(): CloudStorageFileUI[] {
        return observable.array([...this.filesMap.values()]);
    }

    /** Render file menus item base on fileUUID */
    public fileMenus = (
        file: CloudStorageFileUI,
    ): Array<{ key: React.Key; name: React.ReactNode }> => {
        const menus: Array<{ key: FileMenusKey; name: ReactNode }> = [
            { key: "open", name: this.i18n.t("open") },
            { key: "download", name: this.i18n.t("download") },
        ];
        if (file.convert !== "error") {
            menus.push({ key: "rename", name: this.i18n.t("rename") });
        }
        menus.push({
            key: "delete",
            name: <span style={{ color: "red" }}>{this.i18n.t("delete")}</span>,
        });
        return menus;
    };

    /** When a file menus item is clicked */
    public onItemMenuClick = (fileUUID: FileUUID, menuKey: React.Key): void => {
        switch (menuKey) {
            case "open": {
                this.onItemTitleClick(fileUUID);
                break;
            }
            case "download": {
                this.downloadFile(fileUUID);
                break;
            }
            case "rename": {
                this.setRenamePanel(fileUUID);
                break;
            }
            case "delete": {
                Modal.info({
                    content: this.i18n.t("delete-courseware-tips"),
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
    public onItemTitleClick = (fileUUID: FileUUID): void => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            try {
                if (this.compact) {
                    if (file.convert === "error") {
                        Modal.info({ content: this.i18n.t("the-courseware-cannot-be-transcoded") });
                    } else {
                        this.insertCourseware(file);
                    }
                } else {
                    this.previewCourseware(file);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    /** When page delete button is pressed */
    public onBatchDelete = (): void => {
        if (this.selectedFileUUIDs.length > 0) {
            Modal.confirm({
                content: this.i18n.t("delete-select-courseware-tips"),
                onOk: async () => {
                    if (this.selectedFileUUIDs.length > 0) {
                        await this.removeFiles(this.selectedFileUUIDs);
                    }
                },
            });
        }
    };

    /** When upload button is pressed */
    public onUpload = async (): Promise<void> => {
        try {
            const files = await this.pickCourseware();
            if (files && files.length > 0) {
                this.setPanelExpand(true);
                this.uploadTaskManager.addTasks(Array.from(files));
            }
        } catch (e) {
            errorTips(e);
        }
    };

    /** When upload panel close button is pressed */
    public onUploadPanelClose = (): void => {
        if (
            this.uploadTaskManager.pending.length > 0 ||
            this.uploadTaskManager.uploading.length > 0
        ) {
            Modal.confirm({
                title: this.i18n.t("cancel-upload"),
                content: this.i18n.t("cancel-upload-tips"),
                cancelText: this.i18n.t("think-again"),
                onOk: () => this.cancelAll(),
            });
        } else {
            void this.cancelAll();
        }
    };

    /** Restart uploading a file */
    public onUploadRetry = (uploadID: UploadID): void => {
        this.uploadTaskManager.retry(uploadID);
    };

    /** Stop uploading a file */
    public onUploadCancel = async (uploadID: UploadID): Promise<void> => {
        try {
            await this.uploadTaskManager.cancel(uploadID);
        } catch (e) {
            console.error(e);
        }

        const totalUploadTasksCount =
            this.uploadTaskManager.pending.length +
            this.uploadTaskManager.success.length +
            this.uploadTaskManager.failed.length +
            this.uploadTaskManager.uploading.length;

        if (totalUploadTasksCount <= 0) {
            this.setPanelExpand(false);
        }
    };

    /** When a filename is changed to a meaningful new name */
    public onNewFileName = async (
        fileUUID: FileUUID,
        fileNameObject: CloudStorageFileName,
    ): Promise<void> => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            if (file.fileName === fileNameObject.fullName) {
                return;
            } else {
                if (file?.external) {
                    await renameExternalFile({ fileUUID, fileName: fileNameObject.fullName });
                } else {
                    await renameFile({ fileUUID, fileName: fileNameObject.fullName });
                }
                runInAction(() => {
                    file.fileName = fileNameObject.fullName;
                });
            }
        }
    };

    public addExternalFile = (fileName: string, fileURL: string): Promise<void> => {
        return addExternalFile({ fileName, url: fileURL });
    };

    public initialize({
        onCoursewareInserted,
    }: { onCoursewareInserted?: () => void } = {}): () => void {
        this.onCoursewareInserted = onCoursewareInserted;

        void this.refreshFiles();

        if (
            this.uploadTaskManager.pending.length <= 0 &&
            this.uploadTaskManager.uploadingMap.size <= 0
        ) {
            void this.uploadTaskManager.cancelAll();
        }

        const disposer = reaction(
            () => this.uploadTaskManager.uploading.length,
            (currLen, prevLen) => {
                if (currLen < prevLen) {
                    this.refreshFilesNowDebounced();
                }
            },
        );

        return () => {
            disposer();
            window.clearTimeout(this._refreshFilesTimeout);
            this._refreshFilesTimeout = NaN;
            this.convertStatusManager.cancelAllTasks();
            this.onCoursewareInserted = undefined;
        };
    }

    private _refreshFilesTimeout = NaN;
    private _refreshFilesNowTimeout = NaN;

    private clearRefreshFilesNowTimeout(): void {
        window.clearTimeout(this._refreshFilesNowTimeout);
        this._refreshFilesNowTimeout = NaN;
    }

    private async refreshFiles(): Promise<void> {
        window.clearTimeout(this._refreshFilesTimeout);
        this.clearRefreshFilesNowTimeout();

        try {
            const { totalUsage, files: cloudFiles } = await listFiles({ page: 1 });

            runInAction(() => {
                this.totalUsage = totalUsage;
            });

            for (const cloudFile of cloudFiles) {
                const file = this.filesMap.get(cloudFile.fileUUID);

                runInAction(() => {
                    if (file) {
                        file.fileName = cloudFile.fileName;
                        file.createAt = cloudFile.createAt;
                        file.fileSize = cloudFile.fileSize;
                        file.convert = CloudStorageStore.mapConvertStep(cloudFile.convertStep);
                        file.taskToken = cloudFile.taskToken;
                        file.taskUUID = cloudFile.taskUUID;
                        file.external = cloudFile.external;
                    } else {
                        this.filesMap.set(
                            cloudFile.fileUUID,
                            observable.object({
                                ...cloudFile,
                                convert: CloudStorageStore.mapConvertStep(cloudFile.convertStep),
                            }),
                        );
                    }
                });

                if (
                    cloudFile.convertStep === FileConvertStep.Done ||
                    cloudFile.convertStep === FileConvertStep.Failed
                ) {
                    this.convertStatusManager.cancelTask(cloudFile.fileUUID);
                } else {
                    await this.queryConvertStatus(cloudFile.fileUUID);
                }
            }
        } catch (e) {
            errorTips(e);
        }

        if (!this._refreshFilesNowTimeout) {
            this.refreshFilesDebounced(10 * 1000);
        }
    }

    private refreshFilesDebounced(timeout = 500): void {
        window.clearTimeout(this._refreshFilesTimeout);
        this._refreshFilesTimeout = window.setTimeout(() => {
            void this.refreshFiles();
        }, timeout);
    }

    private refreshFilesNowDebounced(timeout = 800): void {
        this.clearRefreshFilesNowTimeout();
        console.log("[cloud storage]: start now refresh");
        this._refreshFilesNowTimeout = window.setTimeout(() => {
            console.log("[cloud storage]: start now refresh!!!!!!!!!");
            void this.refreshFiles();
        }, timeout);
    }

    private previewCourseware(file: CloudStorageFile): void {
        const fileInfo: fileInfo = {
            fileURL: file.fileURL,
            taskUUID: file.taskUUID,
            taskToken: file.taskToken,
            region: file.region,
        };

        switch (file.convert) {
            case "converting": {
                Modal.info({ content: this.i18n.t("please-wait-while-the-lesson-is-transcoded") });
                return;
            }
            case "error": {
                Modal.info({ content: this.i18n.t("the-courseware-cannot-be-transcoded") });
                return;
            }
            default: {
                Modal.info({
                    content: <ResourcePreview fileInfo={fileInfo} />,
                    className: "resource-preview-container",
                    width: "100%",
                    centered: true,
                    closable: true,
                    maskClosable: true,
                    closeIcon: <img src={closeSVG} />,
                });
            }
        }
    }

    private async removeFiles(fileUUIDs: FileUUID[]): Promise<void> {
        try {
            const externalFiles: FileUUID[] = [];
            const normalFiles: FileUUID[] = [];
            fileUUIDs.forEach(fileUUID => {
                if (this.filesMap.get(fileUUID)?.external) {
                    externalFiles.push(fileUUID);
                } else {
                    normalFiles.push(fileUUID);
                }
            });
            await Promise.all([
                removeExternalFiles({ fileUUIDs: externalFiles }),
                removeFiles({ fileUUIDs: normalFiles }),
            ]);
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

    private static mapConvertStep(convertStep: FileConvertStep): CloudStorageConvertStatusType {
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
                console.error("[cloud storage]: cannot map convert step", convertStep);
                return "idle";
            }
        }
    }

    private pickCourseware(): Promise<FileList | null> {
        return new Promise(resolve => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = ".ppt,.pptx,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.ice,.vf";
            input.onchange = () => resolve(input.files);
            input.click();
        });
    }

    /** convert business upload status to ui upload status type */
    private static mapUploadStatus(uploadStatus: UploadStatusType): CloudStorageUploadStatusType {
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
            default: {
                // Failed,
                // Cancelling,
                // Cancelled,
                return "error";
            }
        }
    }

    /** Map upload task type to ui upload task type  */
    private mapUploadTasks(uploadTasks: UploadTask[]): CloudStorageUploadTask[] {
        return observable.array(
            uploadTasks.map(task => ({
                uploadID: task.uploadID,
                fileName: task.file.name,
                percent: task.percent,
                status: CloudStorageStore.mapUploadStatus(task.status),
            })),
        );
    }

    /** Query courseware converting status */
    private async queryConvertStatus(fileUUID: FileUUID): Promise<void> {
        const file = this.filesMap.get(fileUUID);
        if (!file) {
            return;
        }

        switch (getFileExt(file.fileName)) {
            case "ice": {
                if (file.convert === "converting") {
                    await this.convertStatusManager.addTask(file.fileUUID, () =>
                        this.pollH5ConvertStatus(file),
                    );
                }
                break;
            }
            case "ppt":
            case "pdf":
            case "doc":
            case "docx":
            case "pptx": {
                if (file.convert === "idle") {
                    try {
                        if (process.env.NODE_ENV === "development") {
                            console.log(
                                "[cloud-storage] convert start",
                                file.fileUUID,
                                file.fileName,
                            );
                        }
                        const { taskToken, taskUUID } = await convertStart({
                            fileUUID: file.fileUUID,
                        });
                        runInAction(() => {
                            file.convert = "converting";
                            file.taskToken = taskToken;
                            file.taskUUID = taskUUID;
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }

                if (file.convert === "converting") {
                    await this.convertStatusManager.addTask(file.fileUUID, () =>
                        this.pollDocConvertStatus(file),
                    );
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    private async pollH5ConvertStatus(file: CloudStorageFile): Promise<boolean> {
        if (process.env.NODE_ENV === "development") {
            console.log("[cloud-storage] query convert status", file.fileName);
        }

        if (!this.filesMap.has(file.fileUUID)) {
            return true;
        }

        const result = await queryH5ConvertingStatus(file.fileURL);

        if (result.status === "Failed" || result.status === "Finished") {
            if (process.env.NODE_ENV === "development") {
                console.log("[cloud storage]: convert finish", file.fileName);
            }

            if (result.status === "Failed") {
                errorTips(result.error);
            }

            try {
                await convertFinish({ fileUUID: file.fileUUID, region: file.region });
            } catch (e) {
                // ignore error when notifying server finish status
                console.warn(e);
            }

            runInAction(() => {
                file.convert = result.status === "Failed" ? "error" : "success";
            });

            return true;
        }

        return false;
    }

    private async pollDocConvertStatus(file: CloudStorageFile): Promise<boolean> {
        if (process.env.NODE_ENV === "development") {
            console.log("[cloud-storage] query convert status", file.fileName);
        }

        if (!this.filesMap.has(file.fileUUID)) {
            return true;
        }

        let status: ConvertingTaskStatus["status"];
        let progress: ConvertingTaskStatus["progress"];

        try {
            ({ status, progress } = await queryConvertingTaskStatus({
                taskToken: file.taskToken,
                taskUUID: file.taskUUID,
                dynamic: isPPTX(file.fileName),
                region: file.region,
            }));
        } catch (e) {
            console.error(e);
            return false;
        }

        if (status === "Fail" || status === "Finished") {
            if (process.env.NODE_ENV === "development") {
                console.log("[cloud storage]: convert finish", file.fileName);
            }

            try {
                await convertFinish({ fileUUID: file.fileUUID, region: file.region });
            } catch (e) {
                // ignore error when notifying server finish status
                console.warn(e);
            }

            runInAction(() => {
                file.convert = status === "Fail" ? "error" : "success";
            });

            if (status === "Finished") {
                const src = progress?.convertedFileList?.[0].conversionFileUrl;
                if (src) {
                    void getCoursewarePreloader()
                        .preload(src)
                        .catch(error => console.warn(error));
                }
            }

            return true;
        }

        return false;
    }

    private async cancelAll(): Promise<void> {
        try {
            await this.uploadTaskManager.cancelAll();
        } catch (e) {
            console.error(e);
        }
        this.setPanelExpand(false);
    }
}
