/**
 * Cloud Storage file item
 */
export interface CloudStorageFile {
    fileUUID: string;
    fileName: string;
    fileSize: number;
    createAt: Date;
}

export interface CloudStorageUploadStatus {
    /** File uuid */
    fileUUID: string;
    /** File name */
    fileName: string;
    /** Uploading percentage */
    percent: number;
    /** Uploading failed */
    hasError: boolean;
}
