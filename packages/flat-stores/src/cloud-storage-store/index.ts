import { Modal } from "antd";
import {
    CloudStorageFileName,
    CloudStorageStore as CloudStorageStoreBase,
    CloudStorageUploadStatusType,
    CloudStorageUploadTask,
    FileUUID,
    UploadID,
    errorTips,
    DirectoryInfo,
} from "flat-components";
import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import {
    FileConvertStep,
    CloudFile,
    listFiles,
    removeFiles,
    renameFile,
    getWhiteboardTaskData,
    FileResourceType,
    newDirectory,
} from "@netless/flat-server-api";
import { getUploadTaskManager } from "../utils/upload-task-manager";
import { UploadStatusType, UploadTask } from "../utils/upload-task-manager/upload-task";
import { ConvertStatusManager } from "./convert-status-manager";
import { Scheduler } from "./scheduler";
import { FlatI18n } from "@netless/flat-i18n";
import { FlatServices } from "@netless/flat-services";
import { isEqual } from "lodash-es";

export type FileMenusKey = "open" | "download" | "rename" | "delete";

export interface FileMenusItem {
    key: FileMenusKey;
    name: string;
    className?: string;
}

export class CloudStorageStore extends CloudStorageStoreBase {
    public uploadTaskManager = getUploadTaskManager();

    /** User cloud storage files */
    public filesMap = observable.map<FileUUID, CloudFile>();

    public insertCourseware: (file: CloudFile) => void;
    public onCoursewareInserted?: () => void;

    /** In order to avoid multiple calls the fetchMoreCloudStorageData
     * when request fetchMoreCloudStorageData after files length is 0  */
    public hasMoreFile = true;

    public isOpenDirectoryFile = false;

    // a set of taskUUIDs representing querying tasks
    private convertStatusManager = new ConvertStatusManager();

    private scheduler: Scheduler;

    public constructor({
        compact,
        insertCourseware,
    }: {
        compact: boolean;
        insertCourseware: (file: CloudFile) => void;
    }) {
        super();

        this.insertCourseware = insertCourseware;
        this.compact = compact;
        this.scheduler = new Scheduler(this.refreshFiles, 10 * 1000);

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
            onParentDirectoryPathClick: action,
            onBatchDelete: action,
            onUpload: action,
            onUploadPanelClose: action,
            onUploadRetry: action,
            onUploadCancel: action,
            onNewFileName: action,
            onNewEmptyDirectory: action,
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
    public get files(): CloudFile[] {
        return observable.array(
            [...this.filesMap.values()].sort((a, b) => {
                const aIsDir = a.resourceType === "Directory";
                const bIsDir = b.resourceType === "Directory";
                if (aIsDir === bIsDir) {
                    // new directory is first
                    return b.createAt.valueOf() - a.createAt.valueOf();
                }
                // directory file is first
                return aIsDir ? -1 : 1;
            }),
        );
    }

    /** Render file menus item base on fileUUID */
    public fileMenus = (file: CloudFile): FileMenusItem[] => {
        const menus: FileMenusItem[] = [{ key: "open", name: FlatI18n.t("open") }];
        if (
            file.meta.whiteboardConvert?.convertStep !== FileConvertStep.Failed ||
            file.meta.whiteboardProjector?.convertStep !== FileConvertStep.Failed
        ) {
            menus.push({ key: "rename", name: FlatI18n.t("rename") });
        }
        if (file.resourceType !== FileResourceType.Directory) {
            menus.push({ key: "download", name: FlatI18n.t("download") });
        }
        menus.push({
            key: "delete",
            className: "danger",
            name: FlatI18n.t("delete"),
        });
        return menus;
    };

    public onParentDirectoryPathClick = (parentDirectoryPath: string): void => {
        this.setParentDirectoryPath(parentDirectoryPath);
        this.isOpenDirectoryFile = true;
        this.scheduler.invoke();
    };

    /** When a file menus item is clicked */
    public onItemMenuClick = (
        fileUUID: FileUUID,
        menuKey: React.Key,
        pushHistory: (path: string) => void,
    ): void => {
        switch (menuKey) {
            case "open": {
                this.onItemTitleClick(fileUUID, pushHistory);
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
                Modal.confirm({
                    content: FlatI18n.t("delete-courseware-tips"),
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
    public onItemTitleClick = (fileUUID: FileUUID, pushHistory: (path: string) => void): void => {
        const file = this.filesMap.get(fileUUID);
        if (file) {
            try {
                if (file.resourceType === FileResourceType.Directory) {
                    this.setCurrentDirectoryPath(file.fileName);
                    pushHistory(this.parentDirectoryPath);
                    this.isOpenDirectoryFile = true;
                    return;
                }
                if (this.compact) {
                    if (
                        file.meta.whiteboardConvert?.convertStep === FileConvertStep.Failed ||
                        file.meta.whiteboardProjector?.convertStep === FileConvertStep.Failed
                    ) {
                        Modal.info({ content: FlatI18n.t("the-courseware-cannot-be-transcoded") });
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
                content: FlatI18n.t("delete-select-courseware-tips"),
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
                this.uploadTaskManager.addTasks(Array.from(files), this.parentDirectoryPath);
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
                title: FlatI18n.t("cancel-upload"),
                content: FlatI18n.t("cancel-upload-tips"),
                cancelText: FlatI18n.t("think-again"),
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

    public onNewEmptyDirectory = async (): Promise<void> => {
        runInAction(() => {
            this.filesMap.set("temporaryDirectory", {
                fileName: "",
                fileURL: "/",
                fileUUID: "temporaryDirectory",
                fileSize: 0,
                createAt: new Date(),
                resourceType: FileResourceType.Directory,
                meta: {},
            });
        });
    };

    public onNewDirectoryFile = async (directoryInfo: DirectoryInfo): Promise<void> => {
        try {
            if (directoryInfo.directoryName === "") {
                this.filesMap.delete("temporaryDirectory");
                return;
            }

            const { fileUUID } = await newDirectory(directoryInfo);
            runInAction(() => {
                this.filesMap.delete("temporaryDirectory");

                this.filesMap.set(fileUUID, {
                    fileName: directoryInfo.directoryName,
                    fileURL: "",
                    fileUUID: fileUUID,
                    fileSize: 0,
                    createAt: new Date(),
                    resourceType: FileResourceType.Directory,
                    meta: {},
                });
            });
        } catch (e) {
            errorTips(e);
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
            }
            await renameFile({ fileUUID, newName: fileNameObject.name });
            runInAction(() => {
                file.fileName = fileNameObject.fullName;
            });
        }
    };

    public onDropFile(files: FileList): void {
        this.setPanelExpand(true);
        this.uploadTaskManager.addTasks(Array.from(files), this.parentDirectoryPath);
    }

    public fetchMoreCloudStorageData = async (page: number): Promise<void> => {
        if (this.isFetchingFiles) {
            return;
        }

        const cloudStorageTotalPagesFilesCount =
            this.cloudStorageDataPagination * this.cloudStorageSinglePageFiles;

        if (this.filesMap.size >= cloudStorageTotalPagesFilesCount && this.hasMoreFile) {
            runInAction(() => {
                this.isFetchingFiles = true;
            });

            try {
                const { files: cloudFiles } = await listFiles({
                    page,
                    order: "DESC",
                    directoryPath: this.parentDirectoryPath,
                });

                runInAction(() => {
                    this.isFetchingFiles = false;
                });

                this.hasMoreFile = cloudFiles.length > 0;

                const newFiles: Record<string, CloudFile> = {};

                for (const cloudFile of cloudFiles) {
                    const file = this.filesMap.get(cloudFile.fileUUID);

                    runInAction(() => {
                        if (file) {
                            if (file.createAt.valueOf() !== cloudFile.createAt.valueOf()) {
                                file.createAt = cloudFile.createAt;
                            }
                            file.fileName = cloudFile.fileName;
                            file.fileSize = cloudFile.fileSize;
                            file.resourceType = cloudFile.resourceType;
                            if (!isEqual(file.meta, cloudFile.meta)) {
                                file.meta = cloudFile.meta;
                            }
                        } else {
                            newFiles[cloudFile.fileUUID] = observable.object(cloudFile);
                        }
                    });
                }

                runInAction(() => {
                    this.filesMap.merge(newFiles);
                });
            } catch {
                runInAction(() => {
                    this.isFetchingFiles = false;
                });
            }
        }
    };

    public initialize({
        onCoursewareInserted,
    }: { onCoursewareInserted?: () => void } = {}): () => void {
        this.onCoursewareInserted = onCoursewareInserted;

        this.scheduler.start();

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
                    console.log("[cloud storage]: start now refresh");
                    this.scheduler.invoke();
                    this.hasMoreFile = true;
                }
            },
        );

        return () => {
            disposer();
            this.scheduler.stop();
            this.convertStatusManager.cancelAllTasks();
            this.onCoursewareInserted = undefined;
        };
    }

    private refreshFiles = async (): Promise<void> => {
        try {
            const { totalUsage, files: cloudFiles } = await listFiles({
                page: 1,
                order: "DESC",
                directoryPath: this.parentDirectoryPath,
            });

            runInAction(() => {
                this.totalUsage = totalUsage;
            });

            const newFiles: Record<string, CloudFile> = {};
            const toQueryFilesList: string[] = [];

            for (const cloudFile of cloudFiles) {
                const file = this.filesMap.get(cloudFile.fileUUID);

                runInAction(() => {
                    if (file) {
                        if (file.createAt.valueOf() !== cloudFile.createAt.valueOf()) {
                            file.createAt = cloudFile.createAt;
                        }
                        file.fileName = cloudFile.fileName;
                        file.fileSize = cloudFile.fileSize;
                        file.resourceType = cloudFile.resourceType;
                        if (!isEqual(file.meta, cloudFile.meta)) {
                            file.meta = cloudFile.meta;
                        }
                    } else {
                        newFiles[cloudFile.fileUUID] = observable.object(cloudFile);
                    }
                });

                if (cloudFile.meta.whiteboardProjector) {
                    if (
                        cloudFile.meta.whiteboardProjector.convertStep === FileConvertStep.Done ||
                        cloudFile.meta.whiteboardProjector.convertStep === FileConvertStep.Failed
                    ) {
                        this.convertStatusManager.cancelTask(cloudFile.fileUUID);
                    } else {
                        toQueryFilesList.push(cloudFile.fileUUID);
                    }
                }

                if (cloudFile.meta.whiteboardConvert) {
                    if (
                        cloudFile.meta.whiteboardConvert.convertStep === FileConvertStep.Done ||
                        cloudFile.meta.whiteboardConvert.convertStep === FileConvertStep.Failed
                    ) {
                        this.convertStatusManager.cancelTask(cloudFile.fileUUID);
                    } else {
                        toQueryFilesList.push(cloudFile.fileUUID);
                    }
                }
            }

            runInAction(() => {
                if (this.isOpenDirectoryFile) {
                    this.filesMap.replace(newFiles);
                    this.isOpenDirectoryFile = false;
                } else {
                    this.filesMap.merge(newFiles);
                }
            });

            // To query files convert status should be after filesMap is updated.
            for (const fileUUID of toQueryFilesList) {
                await this.queryConvertStatus(fileUUID);
            }
        } catch (e) {
            errorTips(e);
        }
    };

    private async previewCourseware(file: CloudFile): Promise<void> {
        const fileService = await FlatServices.getInstance().requestService("file");
        fileService?.preview(file);
    }

    private async removeFiles(fileUUIDs: FileUUID[]): Promise<void> {
        try {
            const normalFiles: FileUUID[] = [];
            fileUUIDs.forEach(fileUUID => {
                normalFiles.push(fileUUID);
            });
            await Promise.all([removeFiles({ uuids: normalFiles })]);
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

        if (
            file.resourceType === FileResourceType.WhiteboardConvert ||
            file.resourceType === FileResourceType.WhiteboardProjector
        ) {
            const whiteboardTaskData = getWhiteboardTaskData(file.resourceType, file.meta);
            if (whiteboardTaskData === null) {
                return;
            }

            if (
                whiteboardTaskData.convertStep === FileConvertStep.Done ||
                whiteboardTaskData.convertStep === FileConvertStep.Failed
            ) {
                return;
            }
            this.convertStatusManager.addTask(file);
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
