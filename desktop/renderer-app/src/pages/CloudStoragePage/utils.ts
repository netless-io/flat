import Axios from "axios";
import { CloudStorageConvertStatusType } from "flat-components";
import { FileConvertStep } from "../../apiMiddleware/flatServer/constants";
import {
    uploadFinish,
    uploadStart,
    UploadStartResult,
} from "../../apiMiddleware/flatServer/storage";

export const shuntConversionTaskURL = "https://api.netless.link/v5/services/conversion/tasks";

export function getFileUrl(fileName: string, fileUUID: string): string {
    const match = fileName.match(/\.([^.]+)$/);
    if (match) {
        const ext = match[1];
        return `https://flat-storage.oss-cn-hangzhou.aliyuncs.com/cloud-storage/${fileUUID}.${ext}`;
    } else {
        return "";
    }
}

export async function queryTask(
    taskUUID: string,
    taskToken: string,
    dynamic: boolean,
): Promise<TaskStatus> {
    const { data } = await Axios.get<TaskStatus>(
        `${shuntConversionTaskURL}/${taskUUID}?type=${dynamic ? "dynamic" : "static"}`,
        { headers: { token: taskToken /* TODO:, region: 'cn-hz' */ } },
    );
    return data;
}

export interface TaskStatus {
    uuid: string;
    type: "static" | "dynamic";
    status: "Waiting" | "Converting" | "Finished" | "Fail";
    failedReason: string;
    progress?: {
        totalPageSize: number;
        convertedPageSize: number;
        convertedPercentage: number;
        convertedFileList: {
            width: number;
            height: number;
            conversionFileUrl: string;
            preview?: string;
        }[];
        currentStep: "Extracting" | "Packaging" | "GeneratingPreview" | "MediaTranscode";
    };
}

export function download(url: string): void {
    const a = document.createElement("a");
    a.href = url;
    a.click();
}

export interface UploadParams {
    multiple?: boolean;
    accept?: string;
}

export function pickFiles({
    multiple = false,
    accept = "",
}: UploadParams): Promise<FileList | null> {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = multiple;
        input.accept = accept;
        input.onchange = () => resolve(input.files);
        input.click();
    });
}

export function convertStepToType(convertStep: FileConvertStep): CloudStorageConvertStatusType {
    switch (convertStep) {
        case FileConvertStep.None:
            return "idle";
        case FileConvertStep.Failed:
            return "error";
        case FileConvertStep.Converting:
            return "converting";
        case FileConvertStep.Done:
            return "success";
        default:
            return "idle";
    }
}

// n.b. https://caniuse.com/mdn-api_eventtarget
// n.b. https://ungap.github.io/event-target
/**
 * @example
 * uploadManager.upload(file)
 * .onError(console.error)
 * .onInit((fileUUID) => console.log(fileUUID))
 * .onEnd(() => console.log("done"))
 * .onProgress(e => console.log(e.loaded, e.total))
 */
class UploadTask {
    fileUUID = "";
    onError?: (error: Error) => void;
    onInit?: (fileUUID: string) => void;
    onEnd?: () => void;
    onProgress?: (e: ProgressEvent) => void;
}

class UploadManager {
    private static readonly StorageKey = "upload";
    private static readonly MaxConcurrent = 3;

    _tasks = new Set<UploadTask>();
    pending: { file: File; task: UploadTask }[] = [];

    get tasks(): string[] {
        const result: string[] = [];
        for (const { fileUUID } of this._tasks) {
            if (fileUUID) {
                result.push(fileUUID);
            }
        }
        return result;
    }

    _syncTasks(): void {
        localStorage.setItem(UploadManager.StorageKey, JSON.stringify(this.tasks));
    }

    constructor() {
        const failedRaw = localStorage.getItem(UploadManager.StorageKey);
        if (failedRaw) {
            this.clean(JSON.parse(failedRaw));
            localStorage.removeItem(UploadManager.StorageKey);
        }
    }

    clean(fileUUIDs: string[]): void {
        console.log(`TODO: remove zombie tasks ${fileUUIDs}`);
    }

    upload(file: File, task?: UploadTask): UploadTask {
        const currentTask = task ?? new UploadTask();
        if (this._tasks.size >= UploadManager.MaxConcurrent) {
            this.pending.push({ file, task: currentTask });
        } else {
            this._tasks.add(currentTask);
            this._upload(file, currentTask)
                .catch(error => currentTask.onError?.(error))
                .then(() => {
                    this._tasks.delete(currentTask);
                    const { pending } = this;
                    this.pending = [];
                    for (const { file, task } of pending) {
                        this.upload(file, task);
                    }
                });
        }
        return currentTask;
    }

    async _upload(file: File, task: UploadTask): Promise<void> {
        const { name: fileName, size: fileSize } = file;
        let uploadStartResult: UploadStartResult;
        uploadStartResult = await uploadStart({ fileName, fileSize });

        const { filePath, fileUUID, policy, signature } = uploadStartResult;
        task.fileUUID = fileUUID;
        task.onInit?.(fileUUID);

        const formData = new FormData();
        const encodeFileName = encodeURIComponent(fileName);
        formData.append("key", filePath);
        formData.append("name", fileName);
        formData.append("policy", policy);
        formData.append("OSSAccessKeyId", "LTAI5tGuF6ibwB91CWEiKNvJ");
        formData.append("success_action_status", "200");
        formData.append("callback", "");
        formData.append("signature", signature);
        formData.append(
            "Content-Disposition",
            `attachment; filename="${encodeFileName}"; filename*=UTF-8''${encodeFileName}`,
        );
        formData.append("file", file);

        await Axios.post("https://flat-storage.oss-cn-hangzhou.aliyuncs.com", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e: ProgressEvent) => {
                task.onProgress?.(e);
            },
        });

        await uploadFinish({ fileUUID });
        task.onEnd?.();
    }
}

export const uploadManager = new UploadManager();
