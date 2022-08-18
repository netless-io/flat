import {
    CloudFile,
    convertFinish,
    FileConvertStep,
    isServerRequestError,
} from "@netless/flat-server-api";
import type { FlatI18n } from "@netless/flat-i18n";
import type { Toaster } from "../toaster";
import { FlatServiceID, FlatServices } from "../flat-services";
import { getFileExt } from "../services/file/utils";
import { IServiceFile, IServiceFileExtensions } from "../services/file";
import { SideEffectManager } from "side-effect-manager";

export interface FlatServiceProviderFileConfig {
    flatServices: FlatServices;
    toaster: Toaster;
    flatI18n: FlatI18n;
    openPreviewWindow: (file: CloudFile) => void;
}

export class FlatServiceProviderFile implements IServiceFile {
    private sideEffect = new SideEffectManager();
    public flatServices: FlatServiceProviderFileConfig["flatServices"];
    public toaster: FlatServiceProviderFileConfig["toaster"];
    public flatI18n: FlatServiceProviderFileConfig["flatI18n"];
    public openPreviewWindow: FlatServiceProviderFileConfig["openPreviewWindow"];

    public constructor({
        flatServices,
        toaster,
        flatI18n,
        openPreviewWindow,
    }: FlatServiceProviderFileConfig) {
        this.flatServices = flatServices;
        this.toaster = toaster;
        this.flatI18n = flatI18n;
        this.openPreviewWindow = openPreviewWindow;
    }

    public async insert(file: CloudFile): Promise<void> {
        const ext = getFileExt(file.fileName) as IServiceFileExtensions;
        const serviceName = `file-insert:${ext}` as const;

        const insertService = await this.flatServices.requestService(serviceName, false);
        if (!insertService) {
            throw new TypeError(`No service provider for inserting file '${file.fileName}'`);
        }

        try {
            const convertStatus = await this.checkConvertStatus(file, ext);

            if (convertStatus === FileConvertStep.Done || convertStatus === FileConvertStep.None) {
                await insertService.insert(file);
            }
        } catch (e) {
            this.toaster.emit("error", this.flatI18n.t("unable-to-insert-courseware"));
        }

        await insertService.destroy?.();
    }

    public async preview(file: CloudFile): Promise<void> {
        const ext = getFileExt(file.fileName) as IServiceFileExtensions;

        const convertStatus = await this.checkConvertStatus(file, ext);

        if (convertStatus === FileConvertStep.Done || convertStatus === FileConvertStep.None) {
            this.openPreviewWindow(file);
        }
    }

    public async destroy(): Promise<void> {
        this.sideEffect.disposers.forEach((_timeoutDisposer, serviceName) => {
            this.flatServices.shutdownService(serviceName as FlatServiceID);
        });
        this.sideEffect.flushAll();
    }

    private async checkConvertStatus(
        file: CloudFile,
        ext: IServiceFileExtensions,
    ): Promise<FileConvertStep> {
        let convertStep = file.convertStep;
        if (file.convertStep !== FileConvertStep.Done) {
            const serviceName = `file-convert:${ext}` as const;
            const convertService = await this.flatServices.requestService(serviceName, false);
            if (convertService) {
                try {
                    const result = await convertService.queryStatus(file);
                    if (
                        result.status === FileConvertStep.Done ||
                        result.status === FileConvertStep.Failed
                    ) {
                        try {
                            await convertFinish({ fileUUID: file.fileUUID, region: file.region });
                        } catch (e) {
                            // ignore error when notifying server finish status
                            console.warn(e);
                        }
                        if (result.status === FileConvertStep.Failed) {
                            this.toaster.emit(
                                "error",
                                this.flatI18n.t("transcoding-failure-reason", {
                                    reason: result.error
                                        ? isServerRequestError(result.error)
                                            ? result.error.errorMessage
                                            : result.error.message
                                        : "",
                                }),
                            );
                        }
                    } else {
                        this.toaster.emit(
                            "warn",
                            this.flatI18n.t("in-the-process-of-transcoding-tips"),
                        );
                    }
                    convertStep = result.status;
                } catch (e) {
                    console.error(e);
                }
                convertService.destroy?.();
            }
        }
        return convertStep;
    }
}
