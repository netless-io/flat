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
    /** Display upload panel */
    isUploadPanelVisible = true;
    /** Number of finished upload */
    uploadFinishedCount = 0;
    /** Number of total upload */
    uploadTotalCount = 0;
    /** Files in the upload panel list */
    uploadStatuses: CloudStorageUploadStatus[] = [];

    /** It changes when user toggles the expand button */
    private shouldUploadPanelExpand = false;

    /** Always expand upload panel in compact mode */
    get isUploadPanelExpand(): boolean {
        return this.compact || this.shouldUploadPanelExpand;
    }

    /** Human readable user total cloud storage usage */
    get totalUsageHR(): string {
        return isNaN(this.totalUsage) ? "" : prettyBytes(this.totalUsage);
    }

    /** If upload finishes with error */
    get uploadFinishWithError(): boolean {
        let hasError = false;
        for (const status of this.uploadStatuses) {
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
        for (const status of this.uploadStatuses) {
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
        makeObservable<this, "shouldUploadPanelExpand">(this, {
            compact: observable,
            totalUsage: observable,
            files: observable,
            selectedFileUUIDs: observable,
            isUploadPanelVisible: observable,
            uploadFinishedCount: observable,
            uploadTotalCount: observable,
            uploadStatuses: observable,

            shouldUploadPanelExpand: observable,

            isUploadPanelExpand: computed,
            totalUsageHR: computed,
            uploadFinishWithError: computed,

            onUploadPanelExpandChange: action,
            onSelectionChange: action,
        });
    }

    /** When upload panel expand button clicked */
    onUploadPanelExpandChange = (isExpand: boolean): void => {
        this.shouldUploadPanelExpand = isExpand;
    };

    /** When file list item selection changed */
    onSelectionChange = (fileUUIDs: string[]): void => {
        this.selectedFileUUIDs = fileUUIDs;
    };

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
