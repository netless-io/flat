import { makeAutoObservable, observable } from "mobx";
import { v4 as v4uuid } from "uuid";
import Axios, { CancelTokenSource } from "axios";
import {
    uploadFinish,
    uploadStart,
    UploadStartResult,
    RequestErrorCode,
    isServerRequestError,
} from "@netless/flat-server-api";
import { isPPTX } from "../file";

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

        const CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY =
            process.env.CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY;
        if (!CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY) {
            throw new Error("Missing env CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY");
        }

        const { name: fileName, size: fileSize } = this.file;
        try {
            this.updateStatus(UploadStatusType.Starting);

            let uploadStartResult: UploadStartResult;

            try {
                uploadStartResult = await uploadStart({
                    fileName,
                    fileSize,
                    targetDirectoryPath: "/",
                });
            } catch (e) {
                // max concurrent upload count limit
                if (
                    isServerRequestError(e) &&
                    e.errorCode === RequestErrorCode.UploadConcurrentLimit
                ) {
                    console.warn("[cloud-storage]: hit max concurrent upload count limit");
                    uploadStartResult = await uploadStart({
                        fileName,
                        fileSize,
                        targetDirectoryPath: "/",
                    });
                } else {
                    throw e;
                }
            }

            const { ossFilePath, fileUUID, policy, ossDomain, signature } = uploadStartResult;

            if (this.getStatus() !== UploadStatusType.Starting) {
                return;
            }

            this.updateFileUUID(fileUUID);

            const formData = new FormData();
            const encodeFileName = encodeURIComponent(fileName);
            formData.append("key", ossFilePath);
            formData.append("name", fileName);
            formData.append("policy", policy);
            formData.append("OSSAccessKeyId", CLOUD_STORAGE_OSS_ALIBABA_ACCESS_KEY);
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

            await Axios.post(ossDomain, formData, {
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
                    isWhiteboardProjector: isPPTX(this.file.name),
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
