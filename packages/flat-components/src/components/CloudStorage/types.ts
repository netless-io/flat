export type CloudStorageUploadStatusType = "idle" | "error" | "uploading" | "success";

export interface CloudStorageUploadTask {
    /** Upload id */
    uploadID: string;
    /** File name */
    fileName: string;
    /** Uploading percentage */
    percent: number;
    /** Uploading failed */
    status: CloudStorageUploadStatusType;
}

export type CloudStorageConvertStatusType = "idle" | "error" | "converting" | "success";

export interface CloudStorageFileName {
    /** File name without extension */
    name: string;
    /** File extension (e.g. .pdf) */
    ext: string;
    /** File name with extension */
    fullName: string;
}
