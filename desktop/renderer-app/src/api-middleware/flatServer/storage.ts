import { Region } from "flat-components";
import { FileConvertStep } from "./constants";
import { post } from "./utils";

export interface ListFilesPayload {
    page: number;
}
interface ListFilesResponse {
    totalUsage: number;
    files: Array<Omit<CloudFile, "createAt"> & { createAt: number }>;
}

export interface CloudFile {
    fileUUID: string;
    fileName: string;
    fileSize: number;
    fileURL: string;
    convertStep: FileConvertStep;
    /** Query courseware converting status */
    taskUUID: string;
    /** Query courseware converting status */
    taskToken: string;
    createAt: Date;
    region: Region;
    /** online courseware */
    external: boolean;
}

export interface ListFilesResult {
    totalUsage: number;
    files: CloudFile[];
}

export async function listFiles(payload: ListFilesPayload): Promise<ListFilesResult> {
    const { totalUsage, files } = await post<undefined, ListFilesResponse>(
        "cloud-storage/list",
        undefined,
        payload,
    );
    return {
        totalUsage,
        files: files.map(file => ({ ...file, createAt: new Date(file.createAt) })),
    };
}

export interface UploadStartPayload {
    fileName: string;
    fileSize: number;
    region: Region;
}

export interface UploadStartResult {
    fileUUID: string;
    filePath: string;
    policy: string;
    policyURL: string;
    signature: string;
}

export async function uploadStart(payload: UploadStartPayload): Promise<UploadStartResult> {
    return await post("cloud-storage/alibaba-cloud/upload/start", payload);
}
interface UploadFinishPayload {
    fileUUID: string;
}

export async function uploadFinish(payload: UploadFinishPayload): Promise<void> {
    await post("cloud-storage/alibaba-cloud/upload/finish", payload);
}

export interface RenameFilePayload {
    fileUUID: string;
    fileName: string;
}

export async function renameFile(payload: RenameFilePayload): Promise<void> {
    await post("cloud-storage/alibaba-cloud/rename", payload);
}

export interface RemoveFilesPayload {
    fileUUIDs: string[];
}

export async function removeFiles(payload: RemoveFilesPayload): Promise<void> {
    if (payload.fileUUIDs.length > 0) {
        await post("cloud-storage/alibaba-cloud/remove", payload);
    }
}

export interface ConvertStartPayload {
    fileUUID: string;
}

export interface ConvertStartResult {
    taskUUID: string;
    taskToken: string;
}

export async function convertStart(payload: ConvertStartPayload): Promise<ConvertStartResult> {
    return await post("cloud-storage/convert/start", payload);
}

export interface ConvertFinishPayload {
    fileUUID: string;
    region: Region;
}

export async function convertFinish(payload: ConvertFinishPayload): Promise<{}> {
    return await post("cloud-storage/convert/finish", payload);
}

export interface CancelUploadPayload {
    fileUUIDs?: string[];
}

export async function cancelUpload(payload?: CancelUploadPayload): Promise<void> {
    await post("cloud-storage/upload/cancel", payload || {});
}

export interface AddExternalFilePayload {
    fileName: string;
    url: string;
}

export async function addExternalFile(payload: AddExternalFilePayload): Promise<void> {
    await post("cloud-storage/url-cloud/add", payload);
}

export interface RemoveExternalFilesPayload {
    fileUUIDs: string[];
}

export async function removeExternalFiles(payload: RemoveExternalFilesPayload): Promise<void> {
    if (payload.fileUUIDs.length > 0) {
        await post("cloud-storage/url-cloud/remove", payload);
    }
}

export interface RenameExternalFilePayload {
    fileName: string;
    fileUUID: string;
}

export async function renameExternalFile(payload: RenameExternalFilePayload): Promise<void> {
    await post("cloud-storage/url-cloud/rename", payload);
}
