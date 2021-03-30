/**
 * Cloud Storage file item
 */
export interface CloudStorageFile {
    fileUUID: string;
    fileName: string;
    fileSize: number;
    convert: CloudStorageConvertStatusType;
    createAt: Date;
}

export type CloudStorageUploadStatusType = "idle" | "error" | "uploading" | "success";

export interface CloudStorageUploadStatus {
    /** File uuid */
    fileUUID: string;
    /** File name */
    fileName: string;
    /** Uploading percentage */
    percent: number;
    /** Uploading failed */
    status: CloudStorageUploadStatusType;
}

export type CloudStorageConvertStatusType = "idle" | "error" | "converting" | "success";
