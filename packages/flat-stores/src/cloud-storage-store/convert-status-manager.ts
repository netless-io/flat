import { CloudFile, convertFinish, FileConvertStep } from "@netless/flat-server-api";
import { errorTips, FileUUID } from "flat-components";
import { SideEffectManager } from "side-effect-manager";
import { getFileExt } from "../utils/file";
import { runInAction } from "mobx";
import { FlatServices, IServiceFileExtensions } from "@netless/flat-services";

export class ConvertStatusManager {
    private sideEffect = new SideEffectManager();

    private tasks = new Map<FileUUID, CloudFile>();

    public hasTask(fileUUID: FileUUID): boolean {
        return this.tasks.has(fileUUID);
    }

    public async addTask(file: CloudFile, interval = 1500): Promise<void> {
        if (
            file.convertStep === FileConvertStep.Done ||
            file.convertStep === FileConvertStep.Failed ||
            this.tasks.has(file.fileUUID)
        ) {
            return;
        }

        const ext = getFileExt(file.fileName) as IServiceFileExtensions;

        const processor = await FlatServices.getInstance().requestService(`file-convert:${ext}`);
        if (!processor) {
            return;
        }

        if (file.convertStep === FileConvertStep.None) {
            const startResult = await processor.startConvert(file);
            runInAction(() => {
                file.convertStep = FileConvertStep.Converting;
            });
            if (startResult) {
                runInAction(() => {
                    file.taskUUID = startResult.taskUUID;
                    file.taskToken = startResult.taskToken;
                });
            }
        }

        this.tasks.set(file.fileUUID, file);
        this.sideEffect.setInterval(
            async () => {
                const result = await processor.queryStatus(file);
                if (
                    result.status === FileConvertStep.Done ||
                    result.status === FileConvertStep.Failed
                ) {
                    try {
                        await convertFinish({ fileUUID: file.fileUUID, region: file.region });
                    } catch (e) {
                        console.error(e);
                    }
                    runInAction(() => {
                        file.convertStep = result.status;
                    });
                    if (result.error) {
                        errorTips(result.error);
                    }
                    this.cancelTask(file.fileUUID);
                }
            },
            interval,
            file.fileUUID,
        );
    }

    public cancelTask(fileUUID: FileUUID): void {
        this.sideEffect.flush(fileUUID);
        this.tasks.delete(fileUUID);
    }

    public cancelAllTasks(): void {
        this.sideEffect.flushAll();
        this.tasks.clear();
    }
}
