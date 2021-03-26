import React from "react";
import { action, computed, makeObservable, observable } from "mobx";
import prettyBytes from "pretty-bytes";
import { CloudStorageFile, CloudStorageUploadStatus } from "../../components/CloudStorage/types";

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
    uploadStatusesMap = observable.map</** fileUUID */ string, CloudStorageUploadStatus>();
    /** It changes when user toggles the expand button */
    isUploadPanelExpand = false;

    /** Number of total upload */
    get uploadTotalCount(): number {
        return this.uploadStatusesMap.size;
    }

    /** Number of finished upload */
    get uploadFinishedCount(): number {
        let count = 0;
        for (const status of this.uploadStatusesMap.values()) {
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
        for (const status of this.uploadStatusesMap.values()) {
            if (status.status === "error") {
                hasError = true;
                continue;
            } else if (status.percent !== 100) {
                return false;
            }
        }
        return hasError;
    }

    /** Uploading -> Error -> Idle -> Success */
    get sortedUploadStatus(): CloudStorageUploadStatus[] {
        const idle: CloudStorageUploadStatus[] = [];
        const uploading: CloudStorageUploadStatus[] = [];
        const error: CloudStorageUploadStatus[] = [];
        const success: CloudStorageUploadStatus[] = [];
        for (const status of this.uploadStatusesMap.values()) {
            switch (status.status) {
                case "uploading": {
                    uploading.push(status);
                    break;
                }
                case "success": {
                    success.push(status);
                    break;
                }
                case "error": {
                    error.push(status);
                    break;
                }
                default: {
                    idle.push(status);
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

            uploadFinishedCount: computed,
            uploadTotalCount: computed,
            isUploadPanelVisible: computed,
            totalUsageHR: computed,
            uploadFinishWithError: computed,

            setPanelExpand: action,
            setCompact: action,
            onSelectionChange: action,
        });
    }

    setPanelExpand = (isExpand: boolean): void => {
        this.isUploadPanelExpand = isExpand;
    };

    expandPanel = (): void => {
        this.isUploadPanelExpand = true;
    };

    setCompact = (compact: boolean): void => {
        this.compact = compact;
    };

    /** When file list item selection changed */
    onSelectionChange = (fileUUIDs: string[]): void => {
        this.selectedFileUUIDs = fileUUIDs;
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
}
