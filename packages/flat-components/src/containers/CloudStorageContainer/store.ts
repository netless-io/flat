import React from "react";
import { action, computed, makeObservable, observable } from "mobx";
import prettyBytes from "pretty-bytes";
import {
    CloudStorageFile,
    CloudStorageFileName,
    CloudStorageUploadTask,
} from "../../components/CloudStorage/types";

export abstract class CloudStorageStore {
    /** Compact UI for small panel */
    compact = false;
    /** User total cloud storage usage */
    totalUsage = NaN;
    /** User cloud storage files */
    files: CloudStorageFile[] = [];
    /** User selected file uuids */
    selectedFileUUIDs: string[] = [];
    /** Files in the upload panel list */
    uploadTasksMap = observable.map</** uploadUUID */ string, CloudStorageUploadTask>();
    /** It changes when user toggles the expand button */
    isUploadPanelExpand = false;
    /** UUID of file that is under renaming */
    renamingFileUUID?: string = "";

    /** Number of total upload */
    get uploadTotalCount(): number {
        return this.uploadTasksMap.size;
    }

    /** Number of finished upload */
    get uploadFinishedCount(): number {
        let count = 0;
        for (const status of this.uploadTasksMap.values()) {
            if (status.status === "success") {
                count += 1;
            }
        }
        return count;
    }

    /** Display upload panel */
    get isUploadPanelVisible(): boolean {
        return this.uploadTotalCount > 0;
    }

    /** Human readable user total cloud storage usage */
    get totalUsageHR(): string {
        return Number.isNaN(this.totalUsage) ? "" : prettyBytes(this.totalUsage);
    }

    /** If upload finishes with error */
    get uploadFinishWithError(): boolean {
        let hasError = false;
        for (const task of this.uploadTasksMap.values()) {
            if (task.status === "error") {
                hasError = true;
                continue;
            } else if (task.percent !== 100) {
                return false;
            }
        }
        return hasError;
    }

    /** Uploading -> Error -> Idle -> Success */
    get sortedUploadTasks(): CloudStorageUploadTask[] {
        const idle: CloudStorageUploadTask[] = [];
        const uploading: CloudStorageUploadTask[] = [];
        const error: CloudStorageUploadTask[] = [];
        const success: CloudStorageUploadTask[] = [];
        for (const task of this.uploadTasksMap.values()) {
            switch (task.status) {
                case "uploading": {
                    uploading.push(task);
                    break;
                }
                case "success": {
                    success.push(task);
                    break;
                }
                case "error": {
                    error.push(task);
                    break;
                }
                default: {
                    idle.push(task);
                    break;
                }
            }
        }
        return [...uploading, ...error, ...idle, ...success];
    }

    constructor() {
        makeObservable(this, {
            compact: observable,
            totalUsage: observable,
            files: observable,
            selectedFileUUIDs: observable,
            isUploadPanelExpand: observable,
            renamingFileUUID: observable,

            uploadFinishedCount: computed,
            uploadTotalCount: computed,
            isUploadPanelVisible: computed,
            totalUsageHR: computed,
            uploadFinishWithError: computed,

            setRenamePanel: action,
            setPanelExpand: action,
            setCompact: action,
            onSelectionChange: action,
            onRename: action,
        });
    }

    setRenamePanel = (fileUUID?: string): void => {
        this.renamingFileUUID = fileUUID;
    };

    setPanelExpand = (isExpand: boolean): void => {
        this.isUploadPanelExpand = isExpand;
    };

    setCompact = (compact: boolean): void => {
        this.compact = compact;
    };

    /** When file list item selection changed */
    onSelectionChange = (fileUUIDs: string[]): void => {
        this.selectedFileUUIDs = fileUUIDs;
    };

    /** When a rename event is received. Could be empty. Put business logic in `onNewFileName` instead. */
    onRename = (fileUUID: string, fileName?: CloudStorageFileName): void => {
        // hide rename panel
        this.renamingFileUUID = "";

        if (fileName) {
            this.onNewFileName(fileUUID, fileName);
        }
    };

    /** Render file menus item base on fileUUID */
    abstract fileMenus: (
        file: CloudStorageFile,
        index: number,
    ) => Array<{ key: React.Key; name: React.ReactNode }> | void | undefined | null;

    /** When a file menus item is clicked */
    abstract onItemMenuClick: (fileUUID: string, menuKey: React.Key) => void;

    /** When file title click */
    abstract onItemTitleClick: (fileUUID: string) => void;

    /** When page delete button is pressed */
    abstract onBatchDelete(): void;

    /** When upload button is pressed */
    abstract onUpload(): void;

    /** When upload panel close button is pressed */
    abstract onUploadPanelClose(): void;

    /** Restart uploading a file */
    abstract onUploadRetry(fileUUID: string): void;

    /** Stop uploading a file */
    abstract onUploadCancel(fileUUID: string): void;

    /** When a filename is changed to a meaningful new name */
    abstract onNewFileName(fileUUID: string, fileName: CloudStorageFileName): void;
}
