import {
    CloudFile,
    convertFinish,
    FileConvertStep,
    FileResourceType,
    getWhiteboardTaskData,
} from "@netless/flat-server-api";
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
        const whiteboardTaskResult = getWhiteboardTaskData(file.resourceType, file.meta);
        if (whiteboardTaskResult === null) {
            return;
        }
        const { convertStep } = whiteboardTaskResult;
        if (
            convertStep === FileConvertStep.Done ||
            convertStep === FileConvertStep.Failed ||
            this.tasks.has(file.fileUUID)
        ) {
            return;
        }

        const ext = getFileExt(file.fileName) as IServiceFileExtensions;

        const processor = await FlatServices.getInstance().requestService(`file-convert:${ext}`);
        if (!processor) {
            return;
        }

        if (convertStep === FileConvertStep.None) {
            try {
                const startResult = await processor.startConvert(file);
                if (startResult) {
                    if (startResult.resourceType === FileResourceType.WhiteboardProjector) {
                        runInAction(() => {
                            if (file.meta.whiteboardProjector) {
                                file.meta.whiteboardProjector.convertStep =
                                    FileConvertStep.Converting;
                                file.meta.whiteboardProjector.taskUUID = startResult.taskUUID;
                                file.meta.whiteboardProjector.taskToken = startResult.taskToken;
                            }
                        });
                    }
                    if (startResult.resourceType === FileResourceType.WhiteboardConvert) {
                        runInAction(() => {
                            if (file.meta.whiteboardConvert) {
                                file.meta.whiteboardConvert.convertStep =
                                    FileConvertStep.Converting;
                                file.meta.whiteboardConvert.taskUUID = startResult.taskUUID;
                                file.meta.whiteboardConvert.taskToken = startResult.taskToken;
                            }
                        });
                    }
                }
            } catch (error) {
                console.warn(error);
                runInAction(() => {
                    if (file.meta.whiteboardProjector) {
                        file.meta.whiteboardProjector.convertStep = FileConvertStep.Failed;
                    }
                    if (file.meta.whiteboardConvert) {
                        file.meta.whiteboardConvert.convertStep = FileConvertStep.Failed;
                    }
                });
                await convertFinish({ fileUUID: file.fileUUID }).catch(console.warn);
                return;
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
                        await convertFinish({ fileUUID: file.fileUUID });
                    } catch (e) {
                        console.error(e);
                    }
                    runInAction(() => {
                        if (file.meta.whiteboardConvert) {
                            file.meta.whiteboardConvert.convertStep = result.status;
                        }
                        if (file.meta.whiteboardProjector) {
                            file.meta.whiteboardProjector.convertStep = result.status;
                        }
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
