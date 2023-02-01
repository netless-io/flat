import { FileConvertStep, Region } from "./constants";
import { postV2 } from "./utils";

export interface ListFilesPayload {
    page: number;
    order: "ASC" | "DESC";
    /** Number of displays per page */
    size?: number;
    directoryPath: string;
}
interface ListFilesResponse {
    totalUsage: number;
    files: Array<Omit<CloudFile, "createAt"> & { createAt: number }>;
    canCreateDirectory: boolean;
}

interface RegionPayload {
    region: Region;
}

interface ConvertPayload {
    convertStep: FileConvertStep;
}

export interface WhiteboardConvertPayload extends RegionPayload, ConvertPayload {
    taskUUID?: string;
    taskToken?: string;
}

export interface WhiteboardProjectorPayload extends RegionPayload, ConvertPayload {
    taskUUID?: string;
    taskToken?: string;
}

export type metaType = {
    whiteboardConvert?: WhiteboardConvertPayload;
    whiteboardProjector?: WhiteboardProjectorPayload;
};

export enum FileResourceType {
    Directory = "Directory",
    NormalResources = "NormalResources",
    WhiteboardConvert = "WhiteboardConvert",
    WhiteboardProjector = "WhiteboardProjector",
}

export type ResourceType = `${FileResourceType}`;

export interface CloudFile {
    fileUUID: string;
    fileName: string;
    fileSize: number;
    fileURL: string;
    createAt: Date;
    resourceType: ResourceType;
    /** include WhiteboardProjector and WhiteboardConvert convert task info */
    meta: metaType;
}

export interface ListFilesResult {
    totalUsage: number;
    files: CloudFile[];
    canCreateDirectory: boolean;
}

export async function listFiles(payload: ListFilesPayload): Promise<ListFilesResult> {
    const { totalUsage, files, canCreateDirectory } = await postV2<
        ListFilesPayload,
        ListFilesResponse
    >("cloud-storage/list", {
        ...payload,
    });
    return {
        totalUsage,
        files: files.map(file => ({ ...file, createAt: new Date(file.createAt) })),
        canCreateDirectory,
    };
}

export interface UploadStartPayload {
    fileName: string;
    fileSize: number;
    targetDirectoryPath: string;
}

export interface UploadStartResult {
    fileUUID: string;
    ossFilePath: string;
    policy: string;
    ossDomain: string;
    signature: string;
}

export async function uploadStart(payload: UploadStartPayload): Promise<UploadStartResult> {
    return await postV2("cloud-storage/upload/start", payload);
}
interface UploadFinishPayload {
    fileUUID: string;
    /** Use the new backend "projector" to convert file. */
    isWhiteboardProjector?: boolean;
}

export async function uploadFinish(payload: UploadFinishPayload): Promise<void> {
    await postV2("cloud-storage/upload/finish", payload);
}

export interface RenameFilePayload {
    fileUUID: string;
    newName: string;
}

export async function renameFile(payload: RenameFilePayload): Promise<void> {
    await postV2("cloud-storage/rename", payload);
}

export interface RemoveFilesPayload {
    uuids: string[];
}

export async function removeFiles(payload: RemoveFilesPayload): Promise<void> {
    if (payload.uuids.length > 0) {
        for (let i = 0; i < payload.uuids.length; i += 50) {
            const slice = payload.uuids.slice(i, i + 50);
            await postV2("cloud-storage/delete", { uuids: slice });
        }
    }
}

export interface ConvertStartPayload {
    fileUUID: string;
}

export interface ConvertStartResult {
    resourceType: FileResourceType.WhiteboardConvert | FileResourceType.WhiteboardProjector;
    whiteboardProjector?: {
        taskUUID: string;
        taskToken: string;
    };
    whiteboardConvert?: {
        taskUUID: string;
        taskToken: string;
    };
}

export async function convertStart(payload: ConvertStartPayload): Promise<ConvertStartResult> {
    return await postV2("cloud-storage/convert/start", payload);
}

export interface ConvertFinishPayload {
    fileUUID: string;
}

export async function convertFinish(payload: ConvertFinishPayload): Promise<{}> {
    return await postV2("cloud-storage/convert/finish", payload);
}

export interface NewDirectoryPayload {
    parentDirectoryPath: string;
    directoryName: string;
}

export interface NewDirectoryResult {
    fileUUID: string;
}

export async function newDirectory(payload: NewDirectoryPayload): Promise<NewDirectoryResult> {
    return await postV2("cloud-storage/create-directory", payload);
}

export function getWhiteboardTaskData(
    resourceType: ResourceType,
    meta: metaType,
): WhiteboardConvertPayload | WhiteboardProjectorPayload | null {
    let data: WhiteboardConvertPayload | WhiteboardProjectorPayload | null = null;

    switch (resourceType) {
        case "WhiteboardProjector": {
            data = {
                taskUUID: meta.whiteboardProjector!.taskUUID,
                taskToken: meta.whiteboardProjector!.taskToken,
                convertStep: meta.whiteboardProjector!.convertStep,
                region: meta.whiteboardProjector!.region,
            };
            break;
        }
        case "WhiteboardConvert": {
            data = {
                taskUUID: meta.whiteboardConvert!.taskUUID,
                taskToken: meta.whiteboardConvert!.taskToken,
                convertStep: meta.whiteboardConvert!.convertStep,
                region: meta.whiteboardConvert!.region,
            };
            break;
        }
    }

    if (data && assertAllFieldsPresent(data)) {
        return data;
    }

    return null;
}

function assertAllFieldsPresent(obj: Record<string, any>): boolean {
    for (const key in obj) {
        if (obj[key] === undefined) {
            return false;
        }
    }
    return true;
}
