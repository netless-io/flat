import { makeAutoObservable, observable } from "mobx";
import { v4 as v4uuid } from "uuid";
import Axios, { CancelTokenSource } from "axios";
import {
    cancelUpload,
    uploadFinish,
    uploadStart,
    UploadStartResult,
} from "../../api-middleware/flatServer/storage";
import { CLOUD_STORAGE_OSS_ALIBABA_CONFIG } from "../../constants/process";
import { ServerRequestError } from "../error/server-request-error";
import { RequestErrorCode } from "../../constants/error-code";
import { configStore } from "../../stores/config-store";

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
    public uploadID = v4uuid();

    public status = UploadStatusType.Pending;

    public percent = 0;

    public file: File;

    public fileUUID?: string;

    private _cancelTokenSource?: CancelTokenSource;

    public constructor(file: File) {
        this.file = file;

        makeAutoObservable<this, "_cancelTokenSource">(this, {
            file: observable.ref,
            _cancelTokenSource: false,
        });
    }

    public async upload(): Promise<void> {
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
                    region: configStore.getRegion(),
                });
            } catch (e) {
                // max concurrent upload count limit
                if (
                    e instanceof ServerRequestError &&
                    e.errorCode === RequestErrorCode.UploadConcurrentLimit
                ) {
                    console.warn("[cloud-storage]: hit max concurrent upload count limit");
                    await cancelUpload();
                    uploadStartResult = await uploadStart({
                        fileName,
                        fileSize,
                        region: configStore.getRegion(),
                    });
                } else {
                    throw e;
                }
            }

            const { filePath, fileUUID, policy, policyURL, signature } = uploadStartResult;

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

            await Axios.post(policyURL, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (e: ProgressEvent) => {
                    this.updatePercent(Math.floor((100 * e.loaded) / e.total));
                },
                cancelToken: this._cancelTokenSource.token,
            });
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

    public async finish(): Promise<void> {
        if (this.fileUUID) {
            try {
                await uploadFinish({
                    fileUUID: this.fileUUID,
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    public cancelUploadProgress(): void {
        if (this._cancelTokenSource) {
            this._cancelTokenSource.cancel();
            this._cancelTokenSource = void 0;
        }
    }

    public async cancelUpload(): Promise<void> {
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

    public updateFileUUID(fileUUID: string): void {
        this.fileUUID = fileUUID;
    }

    public updatePercent(percent: number): void {
        this.percent = percent;
    }

    public updateStatus(status: UploadStatusType): void {
        this.status = status;
    }

    public getStatus(): UploadStatusType {
        return this.status;
    }
}
