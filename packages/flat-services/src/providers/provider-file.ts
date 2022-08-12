import {
    CloudFile,
    convertFinish,
    FileConvertStep,
    isServerRequestError,
} from "@netless/flat-server-api";
import type { FlatI18n } from "@netless/flat-i18n";
import type { Toaster } from "../toaster";
import { FlatServices } from "../flat-services";
import { getFileExt } from "../services/file/utils";
import { IServiceFile, IServiceFileExtensions } from "../services/file";

export class FlatServiceProviderFile implements IServiceFile {
    public constructor(
        public flatServices: FlatServices,
        public toaster: Toaster,
        public flatI18n: FlatI18n,
    ) {}

    public async insert(file: CloudFile): Promise<void> {
        const ext = getFileExt(file.fileName) as IServiceFileExtensions;

        const insertService = await this.flatServices.requestService(`file-insert:${ext}`);
        if (!insertService) {
            throw new TypeError(`No service provider for inserting file '${file.fileName}'`);
        }

        const convertStatus = await this.checkConvertStatus(file, ext);

        if (convertStatus === FileConvertStep.Done) {
            try {
                await insertService.insert(file);
            } catch (e) {
                this.toaster.emit("error", this.flatI18n.t("unable-to-insert-courseware"));
            }
        }
    }

    public async preview(file: CloudFile): Promise<void> {
        const ext = getFileExt(file.fileName) as IServiceFileExtensions;

        const previewService = await this.flatServices.requestService(`file-preview:${ext}`);
        if (!previewService) {
            throw new TypeError(`No service provider for previewing file '${file.fileName}'`);
        }

        const convertStatus = await this.checkConvertStatus(file, ext);

        if (convertStatus === FileConvertStep.Done) {
            try {
                await previewService.preview(file);
            } catch (e) {
                this.toaster.emit("error", this.flatI18n.t("unable-to-insert-courseware"));
            }
        }
    }

    private async checkConvertStatus(
        file: CloudFile,
        ext: IServiceFileExtensions,
    ): Promise<FileConvertStep> {
        if (file.convertStep !== FileConvertStep.Done) {
            const convertService = await this.flatServices.requestService(`file-convert:${ext}`);
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
                    return result.status;
                } catch (e) {
                    console.error(e);
                    return file.convertStep;
                }
            }
        }
        return file.convertStep;
    }
}
