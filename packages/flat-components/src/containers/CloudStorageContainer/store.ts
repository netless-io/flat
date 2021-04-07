import React from "react";
import { action, computed, makeObservable, observable } from "mobx";
import prettyBytes from "pretty-bytes";
import {
    CloudStorageFile,
    CloudStorageFileName,
    CloudStorageUploadTask,
} from "../../components/CloudStorage/types";

export type UploadID = string;
export type FileUUID = string;

export abstract class CloudStorageStore {
    /** Compact UI for small panel */
    compact = false;
    /** User total cloud storage usage */
    totalUsage = NaN;
    /** User selected file uuids */
    selectedFileUUIDs = observable.array<FileUUID>();
    /** It changes when user toggles the expand button */
    isUploadPanelExpand = false;
    /** UUID of file that is under renaming */
    renamingFileUUID?: FileUUID = "";

    /** Display upload panel */
    get isUploadPanelVisible(): boolean {
        return this.uploadTotalCount > 0;
    }

    /** Human readable user total cloud storage usage */
    get totalUsageHR(): string {
        return Number.isNaN(this.totalUsage) ? "" : prettyBytes(this.totalUsage);
    }

    constructor() {
        makeObservable(this, {
            compact: observable,
            totalUsage: observable,
            selectedFileUUIDs: observable,
            isUploadPanelExpand: observable,
            renamingFileUUID: observable,

            isUploadPanelVisible: computed,
            totalUsageHR: computed,

            setRenamePanel: action,
            setPanelExpand: action,
            setCompact: action,
            onSelectionChange: action,
            onRename: action,
        });
    }

    setRenamePanel = (fileUUID?: FileUUID): void => {
        this.renamingFileUUID = fileUUID;
    };

    setPanelExpand = (isExpand: boolean): void => {
        this.isUploadPanelExpand = isExpand;
    };

    setCompact = (compact: boolean): void => {
        this.compact = compact;
    };

    /** When file list item selection changed */
    onSelectionChange = (fileUUIDs: FileUUID[]): void => {
        this.selectedFileUUIDs.replace(fileUUIDs);
    };

    /** When a rename event is received. Could be empty. Put business logic in `onNewFileName` instead. */
    onRename = (fileUUID: FileUUID, fileName?: CloudStorageFileName): void => {
        // hide rename panel
        this.renamingFileUUID = "";

        if (fileName) {
            this.onNewFileName(fileUUID, fileName);
        }
    };

    /** Uploading -> Error -> Idle -> Success */
    abstract sortedUploadTasks: CloudStorageUploadTask[];

    /** If upload finishes with error */
    abstract uploadFinishWithError: boolean;

    /** Number of finished upload */
    abstract uploadFinishedCount: number;

    /** Number of total upload */
    abstract uploadTotalCount: number;

    /** User cloud storage files */
    abstract files: CloudStorageFile[];

    /** Render file menus item base on fileUUID */
    abstract fileMenus: (
        file: CloudStorageFile,
        index: number,
    ) => Array<{ key: React.Key; name: React.ReactNode }> | void | undefined | null;

    /** When a file menus item is clicked */
    abstract onItemMenuClick: (fileUUID: FileUUID, menuKey: React.Key) => void;

    /** When file title click */
    abstract onItemTitleClick: (fileUUID: FileUUID) => void;

    /** When page delete button is pressed */
    abstract onBatchDelete(): void;

    /** When upload button is pressed */
    abstract onUpload(): void;

    /** When upload panel close button is pressed */
    abstract onUploadPanelClose(): void;

    /** Restart uploading a file */
    abstract onUploadRetry(fileUUID: FileUUID): void;

    /** Stop uploading a file */
    abstract onUploadCancel(fileUUID: FileUUID): void;

    /** When a filename is changed to a meaningful new name */
    abstract onNewFileName(fileUUID: FileUUID, fileName: CloudStorageFileName): void;
}
