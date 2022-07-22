import { FlatCourseware, FlatCoursewareLegacyPPTXScene } from "@netless/flat-courseware";
import {
    CloudFile,
    convertFinish,
    FileConvertStep,
    RequestErrorCode,
    ServerRequestError,
} from "@netless/flat-server-api";
import { extractLegacySlideUrlPrefix, queryConvertingTaskStatus } from "./courseware-converting";
import { getFileExt, isPPTX } from "./utils";

export class FlatCoursewareNetless extends FlatCourseware {
    public constructor() {
        super();
    }

    public async insert(file: CloudFile): Promise<void> {
        return this.handleFile("insert", file);
    }

    public async preview(file: CloudFile): Promise<void> {
        return this.handleFile("preview", file);
    }

    public async handleFile(action: "insert" | "preview", file: CloudFile): Promise<void> {
        if (file.convertStep === FileConvertStep.Converting) {
            this.events.emit("warning", "in-the-process-of-transcoding-tips");
            return;
        }

        const ext = getFileExt(file.fileName);

        switch (ext) {
            case "jpg":
            case "jpeg":
            case "png":
            case "webp": {
                this.events.emit(action, { type: "image", file });
                break;
            }
            case "mp3":
            case "mp4": {
                this.events.emit(action, { type: "media", file });
                break;
            }
            case "doc":
            case "docx":
            case "ppt":
            case "pptx":
            case "pdf": {
                await this.handleDocs(action, file);
                break;
            }
            case "ice": {
                this.events.emit(action, { type: "ice", file });
                break;
            }
            case "vf": {
                this.events.emit(action, { type: "vf", file });
                break;
            }
            default: {
                console.error(`[FlatCourseware]: ${action} unknown format "${file.fileName}"`);
            }
        }
    }

    private async handleDocs(action: "insert" | "preview", file: CloudFile): Promise<void> {
        const { taskUUID, taskToken, region, resourceType } = file;
        const convertingStatus = await queryConvertingTaskStatus({
            taskUUID,
            taskToken,
            dynamic: isPPTX(file.fileName),
            region,
            projector: resourceType === "WhiteboardProjector",
        });

        if (file.convertStep !== FileConvertStep.Done) {
            if (convertingStatus.status === "Finished" || convertingStatus.status === "Fail") {
                try {
                    await convertFinish({ fileUUID: file.fileUUID, region: file.region });
                } catch (e) {
                    if (
                        e instanceof ServerRequestError &&
                        e.errorCode === RequestErrorCode.FileIsConverted
                    ) {
                        // ignore this error
                        // there's another `convertFinish()` call in ./store.tsx
                        // we call this api in two places to make sure the file is correctly converted (in server)
                    } else {
                        console.error(e);
                    }
                }
                if (convertingStatus.status === "Fail") {
                    this.events.emit("error", {
                        message: "transcoding-failure-reason",
                        args: {
                            reason: convertingStatus.errorMessage,
                        },
                    });
                    return;
                }
            } else {
                this.events.emit("warning", "in-the-process-of-transcoding-tips");
                return;
            }
        }

        if (convertingStatus.status === "Finished") {
            if (convertingStatus.progress) {
                // Netless legacy PPT conversion
                if (action === "insert") {
                    const scenes: FlatCoursewareLegacyPPTXScene[] =
                        convertingStatus.progress.convertedFileList.map((f, i) => ({
                            name: `${i + 1}`,
                            ppt: {
                                src: f.conversionFileUrl,
                                width: f.width,
                                height: f.height,
                                previewURL: f.preview,
                            },
                        }));
                    this.events.emit("insert", { type: "pptx-legacy", file, scenes });
                    return;
                } else if (action === "preview") {
                    const urlPrefix = extractLegacySlideUrlPrefix(
                        convertingStatus.progress.convertedFileList[0].conversionFileUrl,
                    );
                    if (urlPrefix) {
                        this.events.emit("preview", { type: "pptx", file, urlPrefix });
                        return;
                    }
                }
            }
            if (convertingStatus.prefix) {
                // Netless Projector PPT conversion
                this.events.emit(action, {
                    type: "pptx",
                    file,
                    urlPrefix: convertingStatus.prefix,
                });
                return;
            }
        }

        this.events.emit("error", "unable-to-insert-courseware");
    }
}
