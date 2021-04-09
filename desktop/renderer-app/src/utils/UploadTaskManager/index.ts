import { makeAutoObservable, observable, runInAction } from "mobx";
import { cancelUpload } from "../../apiMiddleware/flatServer/storage";
import { UploadStatusType, UploadTask } from "./UploadTask";
import { UploadID } from "flat-components";

export enum UploadTaskManagerStatusType {
    Idle = 1,
    Starting,
    Cancelling,
}

export class UploadTaskManager {
    private static readonly MaxUploadingCount = 3;

    status = UploadTaskManagerStatusType.Idle;

    uploadingMap = observable.map<UploadID, UploadTask>();

    pending = observable.array<UploadTask>();
    success = observable.array<UploadTask>();
    failed = observable.array<UploadTask>();

    get uploading(): UploadTask[] {
        return observable.array([...this.uploadingMap.values()].reverse());
    }

    constructor() {
        makeAutoObservable(this);
    }

    addTasks(files: File[]): void {
        for (const file of files) {
            const task = new UploadTask(file);
            this.pending.unshift(task);
        }
        this.startUpload();
    }

    async startUpload(): Promise<void> {
        if (this.getStatus() === UploadTaskManagerStatusType.Cancelling) {
            return;
        }

        if (this.pending.length <= 0) {
            this.updateStatus(UploadTaskManagerStatusType.Idle);
            return;
        }

        this.updateStatus(UploadTaskManagerStatusType.Starting);

        while (this.uploadingMap.size < UploadTaskManager.MaxUploadingCount) {
            if (this.getStatus() !== UploadTaskManagerStatusType.Starting) {
                return;
            }

            const task = this.popPendingTask();
            if (task) {
                runInAction(() => {
                    this.uploadingMap.set(task.uploadID, task);
                });
                if (process.env.NODE_ENV === "development") {
                    console.log(`[cloud storage]: UploadTaskManager uploads "${task.file.name}"`);
                }
                task.upload().then(() => this.finishUpload(task));
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    finishUpload(task: UploadTask): void {
        this.uploadingMap.delete(task.uploadID);
        if (task.status === UploadStatusType.Success) {
            this.success.unshift(task);
        } else if (task.status === UploadStatusType.Failed) {
            this.failed.unshift(task);
        }
        this.startUpload();
    }

    retry(uploadID: UploadID): void {
        const index = this.failed.findIndex(task => task.uploadID === uploadID);
        if (index >= 0) {
            const task = this.failed[index];
            this.failed.splice(index, 1);
            this.addTasks([task.file]);
        }
    }

    async cancel(uploadID: UploadID): Promise<void> {
        const task = this.uploadingMap.get(uploadID);
        if (task) {
            await task.cancelUpload();
            runInAction(() => {
                this.uploadingMap.delete(uploadID);
            });
        }
    }

    async cancelAll(): Promise<void> {
        if (this.getStatus() === UploadTaskManagerStatusType.Cancelling) {
            return;
        }

        this.updateStatus(UploadTaskManagerStatusType.Cancelling);

        for (const task of this.uploadingMap.values()) {
            task.cancelUploadProgress();
        }

        if (this.uploadingMap.size > 0) {
            await cancelUpload();
        }

        runInAction(() => {
            this.pending.clear();
            this.success.clear();
            this.failed.clear();
            this.uploadingMap.clear();
        });

        this.updateStatus(UploadTaskManagerStatusType.Idle);
    }

    updateStatus(status: UploadTaskManagerStatusType): void {
        this.status = status;
    }

    getStatus(): UploadTaskManagerStatusType {
        return this.status;
    }

    private popPendingTask(): UploadTask | undefined {
        return this.pending.pop();
    }
}

let uploadTaskManager: UploadTaskManager | undefined;

export function getUploadTaskManager(): UploadTaskManager {
    if (!uploadTaskManager) {
        uploadTaskManager = new UploadTaskManager();
    }
    return uploadTaskManager;
}
