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
    public compact = false;
    /** User total cloud storage usage */
    public totalUsage = NaN;
    /** User selected file uuids */
    public selectedFileUUIDs = observable.array<FileUUID>();
    /** It changes when user toggles the expand button */
    public isUploadPanelExpand = false;
    /** UUID of file that is under renaming */
    public renamingFileUUID?: FileUUID = "";
    /** Cloud storage single page data returned by the server */
    public cloudStorageSinglePageFiles = 50;
    /** In order to avoid multiple calls the fetchMoreCloudStorageData when fetching data */
    public isFetchingFiles = false;

    /** Display upload panel */
    public get isUploadPanelVisible(): boolean {
        return this.uploadTotalCount > 0;
    }

    /** Human readable user total cloud storage usage */
    public get totalUsageHR(): string {
        return Number.isNaN(this.totalUsage) ? "" : prettyBytes(this.totalUsage);
    }

    /** get fetch data pagination value of cloudStorage. */
    public get cloudStorageDataPagination(): number {
        return Math.ceil(this.files.length / this.cloudStorageSinglePageFiles);
    }

    /** Uploading -> Error -> Idle -> Success */
    public get sortedUploadTasks(): CloudStorageUploadTask[] {
        return observable.array([
            ...this.uploadingUploadTasks,
            ...this.failedUploadTasks,
            ...this.pendingUploadTasks,
            ...this.successUploadTasks,
        ]);
    }

    /** If upload finishes with error */
    public get uploadFinishWithError(): boolean {
        if (this.pendingUploadTasks.length > 0 || this.uploadingUploadTasks.length > 0) {
            return false;
        }
        return this.failedUploadTasks.length > 0;
    }

    /** Number of finished upload */
    public get uploadFinishedCount(): number {
        // @TODO use percentage instead
        return this.successUploadTasks.length;
    }

    /** Number of total upload */
    public get uploadTotalCount(): number {
        return this.sortedUploadTasks.length;
    }

    protected constructor() {
        makeObservable(this, {
            compact: observable,
            totalUsage: observable,
            selectedFileUUIDs: observable,
            isUploadPanelExpand: observable,
            renamingFileUUID: observable,
            isFetchingFiles: observable,

            isUploadPanelVisible: computed,
            totalUsageHR: computed,
            sortedUploadTasks: computed,
            uploadFinishWithError: computed,
            uploadFinishedCount: computed,
            uploadTotalCount: computed,

            setRenamePanel: action,
            setPanelExpand: action,
            setCompact: action,
            onSelectionChange: action,
            onRename: action,
        });
    }

    public setRenamePanel = (fileUUID?: FileUUID): void => {
        this.renamingFileUUID = fileUUID;
    };

    public setPanelExpand = (isExpand: boolean): void => {
        this.isUploadPanelExpand = isExpand;
    };

    public setCompact = (compact: boolean): void => {
        this.compact = compact;
    };

    /** When file list item selection changed */
    public onSelectionChange = (fileUUIDs: FileUUID[]): void => {
        this.selectedFileUUIDs.replace(fileUUIDs);
    };

    /** When a rename event is received. Could be empty. Put business logic in `onNewFileName` instead. */
    public onRename = (fileUUID: FileUUID, fileName?: CloudStorageFileName): void => {
        // hide rename panel
        this.renamingFileUUID = "";

        if (fileName) {
            this.onNewFileName(fileUUID, fileName);
        }
    };

    public abstract pendingUploadTasks: CloudStorageUploadTask[];

    public abstract uploadingUploadTasks: CloudStorageUploadTask[];

    public abstract successUploadTasks: CloudStorageUploadTask[];

    public abstract failedUploadTasks: CloudStorageUploadTask[];

    /** User cloud storage files */
    public abstract files: CloudStorageFile[];

    /** Render file menus item base on fileUUID */
    public abstract fileMenus: (
        file: CloudStorageFile,
        index: number,
    ) => Array<{ key: React.Key; name: React.ReactNode }> | void | undefined | null;

    /** When a file menus item is clicked */
    public abstract onItemMenuClick: (fileUUID: FileUUID, menuKey: React.Key) => void;

    /** When file title click */
    public abstract onItemTitleClick: (fileUUID: FileUUID) => void;

    /** When page delete button is pressed */
    public abstract onBatchDelete(): void;

    /** When upload button is pressed */
    public abstract onUpload(): void;

    /** When upload panel close button is pressed */
    public abstract onUploadPanelClose(): void;

    /** Restart uploading a file */
    public abstract onUploadRetry(fileUUID: FileUUID): void;

    /** Stop uploading a file */
    public abstract onUploadCancel(fileUUID: FileUUID): void;

    /** When a filename is changed to a meaningful new name */
    public abstract onNewFileName(fileUUID: FileUUID, fileName: CloudStorageFileName): void;

    /** Add Online HTML5 Courseware to Cloud Storage */
    public abstract addExternalFile(fileName: string, fileURL: string): Promise<void>;

    /** When file(s) are dropped in the container. */
    public abstract onDropFile(files: FileList): void;

    /** When file(s) are dropped in the container. */
    public abstract onDropFile(files: FileList): void;

    /** When cloudStorage files is 50 or more, pull up to bottom that loading will fetch more pagination Data of the cloudStorage. */
    public abstract fetchMoreCloudStorageData: (page: number) => Promise<void>;
}
