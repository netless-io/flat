import { makeAutoObservable, observable } from "mobx";
import { v4 as v4uuid } from "uuid";
import Axios, { CancelTokenSource } from "axios";
import {
    cancelUpload,
    uploadFinish,
    uploadStart,
    UploadStartResult,
} from "../../apiMiddleware/flatServer/storage";
import { CLOUD_STORAGE_OSS_ALIBABA_CONFIG } from "../../constants/Process";
import { ServerRequestError } from "../error/ServerRequestError";

export enum UploadStatusType {
    Pending = 1,
    Starting,
    Uploading,
    Success,
    Failed,
    Cancelling,
    Cancelled,
}

export class UploadTask {
    uploadID = v4uuid();

    status = UploadStatusType.Pending;

    percent = 0;

    file: File;

    fileUUID?: string;

    private _cancelTokenSource?: CancelTokenSource;

    constructor(file: File) {
        this.file = file;

        makeAutoObservable<this, "_cancelTokenSource">(this, {
            file: observable.ref,
            _cancelTokenSource: false,
        });
    }

    async upload(): Promise<void> {
        if (this.getStatus() !== UploadStatusType.Pending) {
            return;
        }

        const { name: fileName, size: fileSize } = this.file;
        try {
            this.updateStatus(UploadStatusType.Starting);

            let uploadStartResult: UploadStartResult;

            try {
                uploadStartResult = await uploadStart({
                    fileName,
                    fileSize,
                });
            } catch (e) {
                // max concurrent upload count limit
                if (e instanceof ServerRequestError && e.errorCode === 700000) {
                    console.warn("[cloud-storage]: hit max concurrent upload count limit");
                    await cancelUpload();
                    uploadStartResult = await uploadStart({
                        fileName,
                        fileSize,
                    });
                } else {
                    throw e;
                }
            }

            const { filePath, fileUUID, policy, signature } = uploadStartResult;

            if (this.getStatus() !== UploadStatusType.Starting) {
                return;
            }

            this.updateFileUUID(fileUUID);

            const formData = new FormData();
            const encodeFileName = encodeURIComponent(fileName);
            formData.append("key", filePath);
            formData.append("name", fileName);
            formData.append("policy", policy);
            formData.append("OSSAccessKeyId", CLOUD_STORAGE_OSS_ALIBABA_CONFIG.accessKey);
            formData.append("success_action_status", "200");
            formData.append("callback", "");
            formData.append("signature", signature);
            formData.append(
                "Content-Disposition",
                `attachment; filename="${encodeFileName}"; filename*=UTF-8''${encodeFileName}`,
            );
            formData.append("file", this.file);

            this._cancelTokenSource = Axios.CancelToken.source();

            this.updateStatus(UploadStatusType.Uploading);

            await Axios.post(
                `https://${CLOUD_STORAGE_OSS_ALIBABA_CONFIG.bucket}.${CLOUD_STORAGE_OSS_ALIBABA_CONFIG.region}.aliyuncs.com`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e: ProgressEvent) => {
                        this.updatePercent(Math.floor((100 * e.loaded) / e.total));
                    },
                    cancelToken: this._cancelTokenSource.token,
                },
            );
        } catch (e) {
            if (e instanceof Axios.Cancel) {
                this.updateStatus(UploadStatusType.Cancelled);
            } else {
                console.error(e);
                if (this.fileUUID) {
                    try {
                        await cancelUpload({ fileUUIDs: [this.fileUUID] });
                    } catch (e) {
                        console.error(e);
                    }
                }
                this.updateStatus(UploadStatusType.Failed);
            }
        }

        this._cancelTokenSource = void 0;

        if (this.getStatus() === UploadStatusType.Uploading) {
            await this.finish();
            this.updateStatus(UploadStatusType.Success);
        }
    }

    async finish(): Promise<void> {
        if (this.fileUUID) {
            try {
                await uploadFinish({ fileUUID: this.fileUUID });
            } catch (e) {
                console.error(e);
            }
        }
    }

    cancelUploadProgress(): void {
        if (this._cancelTokenSource) {
            this._cancelTokenSource.cancel();
            this._cancelTokenSource = void 0;
        }
    }

    async cancelUpload(): Promise<void> {
        if (this.getStatus() === UploadStatusType.Cancelling || !this.fileUUID) {
            return;
        }

        this.updateStatus(UploadStatusType.Cancelling);

        try {
            this.cancelUploadProgress();
            await cancelUpload({ fileUUIDs: [this.fileUUID] });
        } catch (e) {
            console.error(e);
        }

        this.updateStatus(UploadStatusType.Cancelled);
    }

    updateFileUUID(fileUUID: string): void {
        this.fileUUID = fileUUID;
    }

    updatePercent(percent: number): void {
        this.percent = percent;
    }

    updateStatus(status: UploadStatusType): void {
        this.status = status;
    }

    getStatus(): UploadStatusType {
        return this.status;
    }
}
