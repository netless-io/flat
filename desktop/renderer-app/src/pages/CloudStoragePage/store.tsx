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
import {
    ConvertingTaskStatus,
    queryConvertingTaskStatus,
} from "../../apiMiddleware/courseware-converting";
import { FileConvertStep } from "../../apiMiddleware/flatServer/constants";
import {
    CloudFile,
    convertFinish,
    convertStart,
    listFiles,
    removeFiles,
    renameFile,
} from "../../apiMiddleware/flatServer/storage";
import { errorTips } from "../../components/Tips/ErrorTips";
import { getCoursewarePreloader } from "../../utils/CoursewarePreloader";
import { getUploadTaskManager } from "../../utils/UploadTaskManager";
import { UploadStatusType, UploadTask } from "../../utils/UploadTaskManager/UploadTask";

export type CloudStorageFile = CloudStorageFileUI &
    Pick<CloudFile, "fileURL" | "taskUUID" | "taskToken">;

export type FileMenusKey = "download" | "rename" | "delete";

export class CloudStorageStore extends CloudStorageStoreBase {
    uploadTaskManager = getUploadTaskManager();

    /** User cloud storage files */
    filesMap = observable.map<FileUUID, CloudStorageFile>();

    insertCourseware: (file: CloudStorageFile) => void;

    // a set of taskUUIDs representing querying tasks
    private _convertStatusQuerying = new Map<FileUUID, number>();

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

    get pendingUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.pending);
    }

    get uploadingUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.uploading);
    }

    get successUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.success);
    }

    get failedUploadTasks(): CloudStorageUploadTask[] {
        return this.mapUploadTasks(this.uploadTaskManager.failed);
    }

    /** User cloud storage files */
    get files(): CloudStorageFileUI[] {
        return observable.array([...this.filesMap.values()]);
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
            try {
                if (this.compact) {
                    this.insertCourseware(file);
                } else {
                    this.previewCourseware(file);
                }
            } catch (e) {
                console.error(e);
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
    onUploadPanelClose = (): void => {
        if (
            this.uploadTaskManager.pending.length > 0 ||
            this.uploadTaskManager.uploading.length > 0
        ) {
            Modal.confirm({
                title: "取消上传",
                content: "上传尚未完成，确定取消所有正在进行的上传吗?",
                cancelText: "再想想",
                onOk: () => this.cancelAll(),
            });
        } else {
            this.cancelAll();
        }
    };

    /** Restart uploading a file */
    onUploadRetry = (uploadID: UploadID): void => {
        this.uploadTaskManager.retry(uploadID);
    };

    /** Stop uploading a file */
    onUploadCancel = async (uploadID: UploadID): Promise<void> => {
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
    onNewFileName = async (
        fileUUID: FileUUID,
        fileNameObject: CloudStorageFileName,
    ): Promise<void> => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            if (file.fileName === fileNameObject.fullName) {
                return;
            } else {
                await renameFile({ fileUUID, fileName: fileNameObject.fullName });
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
            disposer();
            window.clearTimeout(this._refreshFilesTimeout);
            this._refreshFilesTimeout = NaN;
            for (const timeout of this._convertStatusQuerying.values()) {
                window.clearTimeout(timeout);
            }
            this._convertStatusQuerying.clear();
        };
    }

    private _refreshFilesTimeout = NaN;

    private async refreshFiles(): Promise<void> {
        window.clearTimeout(this._refreshFilesTimeout);

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
                        file.convert = this.mapConvertStep(cloudFile.convertStep);
                        file.taskToken = cloudFile.taskToken;
                        file.taskUUID = cloudFile.taskUUID;
                    } else {
                        this.filesMap.set(
                            cloudFile.fileUUID,
                            observable.object({
                                ...cloudFile,
                                convert: this.mapConvertStep(cloudFile.convertStep),
                            }),
                        );
                    }
                });

                if (
                    cloudFile.convertStep === FileConvertStep.Done ||
                    cloudFile.convertStep === FileConvertStep.Failed
                ) {
                    this._convertStatusQuerying.delete(cloudFile.fileUUID);
                } else if (!this._convertStatusQuerying.has(cloudFile.fileUUID)) {
                    this._convertStatusQuerying.set(cloudFile.fileUUID, NaN);
                    this.queryConvertStatus(cloudFile.fileUUID);
                }
            }
        } catch (e) {
            errorTips(e);
        }

        this.refreshFilesDebounced(10 * 1000);
    }

    private refreshFilesDebounced(timeout = 500): void {
        window.clearTimeout(this._refreshFilesTimeout);
        this._refreshFilesTimeout = window.setTimeout(() => {
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
            input.accept = ".ppt,.pptx,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.mp3,.mp4";
            input.onchange = () => resolve(input.files);
            input.click();
        });
    }

    /** convert business upload status to ui upload status type */
    private mapUploadStatus(uploadStatus: UploadStatusType): CloudStorageUploadStatusType {
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
                status: this.mapUploadStatus(task.status),
            })),
        );
    }

    /** Query courseware converting status */
    private async queryConvertStatus(fileUUID: FileUUID): Promise<void> {
        const file = this.filesMap.get(fileUUID);
        if (!file) {
            return;
        }

        const isDynamic = file.fileName.endsWith(".pptx");

        if (!isDynamic && !/\.(ppt|pdf|doc|docx)$/i.test(file.fileName)) {
            return;
        }

        if (file.convert === "idle") {
            try {
                if (process.env.NODE_ENV === "development") {
                    console.log("[cloud-storage] convert start", file.fileUUID, file.fileName);
                }
                const { taskToken, taskUUID } = await convertStart({ fileUUID: file.fileUUID });
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
            this.pollConvertState(file, isDynamic);
        }
    }

    private async pollConvertState(file: CloudStorageFile, dynamic: boolean): Promise<void> {
        if (process.env.NODE_ENV === "development") {
            console.log("[cloud-storage] query convert status", file.fileName);
        }

        let status: ConvertingTaskStatus["status"];

        try {
            ({ status } = await queryConvertingTaskStatus({
                taskToken: file.taskToken,
                taskUUID: file.taskUUID,
                dynamic,
            }));
        } catch (e) {
            console.error(e);
            return;
        }

        if (status === "Fail" || status === "Finished") {
            if (process.env.NODE_ENV === "development") {
                console.log("[cloud storage]: convert finish", file.fileName);
            }

            try {
                await convertFinish({ fileUUID: file.fileUUID });
            } catch (e) {
                // ignore error when notifying server finish status
                console.warn(e);
            }

            runInAction(() => {
                file.convert = status === "Fail" ? "error" : "success";
            });

            if (status === "Finished") {
                getCoursewarePreloader().preload(file.taskUUID, dynamic ? "dynamic" : "static");
            }

            return;
        }

        if (this._convertStatusQuerying.has(file.fileUUID)) {
            this._convertStatusQuerying.set(
                file.fileUUID,
                window.setTimeout(() => this.pollConvertState(file, dynamic), 1500),
            );
        }
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
