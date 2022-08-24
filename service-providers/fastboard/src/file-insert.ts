import { v4 as uuidv4 } from "@lukeed/uuid";
import type { FastboardApp } from "@netless/fastboard";
import { BuiltinApps } from "@netless/window-manager";
import { ApplianceNames, SceneDefinition } from "white-web-sdk";

import type { FlatI18n } from "@netless/flat-i18n";
import type { CloudFile } from "@netless/flat-server-api";
import {
    getFileExt,
    isPPTX,
    queryConvertingTaskStatus,
} from "@netless/flat-service-provider-file-convert-netless";
import { IServiceFileInsert, IServiceFileInsertOptions, Toaster } from "@netless/flat-services";

import type { Fastboard } from "./index";

export class FastboardFileInsert implements IServiceFileInsert {
    public constructor(
        public fastboard: Fastboard,
        public flatI18n: FlatI18n,
        public toaster: Toaster,
    ) {}

    public async insert(file: CloudFile, options: IServiceFileInsertOptions): Promise<void> {
        const fastboardApp = this.fastboard._app$.value;
        if (!fastboardApp) {
            this.toaster.emit("warn", this.flatI18n.t("unable-to-insert-courseware"));
            return;
        }

        try {
            switch (getFileExt(file.fileName)) {
                case "jpg":
                case "jpeg":
                case "png":
                case "webp": {
                    await insertImage(file, fastboardApp, options?.coord);
                    break;
                }
                case "mp3":
                case "mp4": {
                    await insertMedia(file, fastboardApp);
                    break;
                }
                case "doc":
                case "docx":
                case "ppt":
                case "pptx":
                case "pdf": {
                    await insertDocs(file, fastboardApp, this.flatI18n, this.toaster);
                    break;
                }
                case "ice": {
                    await insertZippedH5(file, fastboardApp);
                    break;
                }
                case "vf": {
                    await insertVf(file, fastboardApp);
                    break;
                }
                default: {
                    throw new Error(
                        `[cloud storage]: insert unknown format "${file.fileName}" into whiteboard`,
                    );
                }
            }
        } catch (e) {
            this.toaster.emit("error", this.flatI18n.t("unable-to-insert-courseware"));
            console.error(e);
        }
    }
}

export async function insertImage(
    file: CloudFile,
    fastboardApp: FastboardApp,
    coord: IServiceFileInsertOptions["coord"],
): Promise<void> {
    // 1. shrink the image a little to fit the screen
    const maxWidth = window.innerWidth * 0.6;

    let width: number;
    let height: number;

    if (file.fileURL) {
        ({ width, height } = await new Promise<{ width: number; height: number }>(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve({ width: window.innerWidth, height: window.innerHeight });
            img.src = file.fileURL;
        }));
    } else {
        ({ innerWidth: width, innerHeight: height } = window);
    }

    let scale = 1;
    if (width > maxWidth) {
        scale = maxWidth / width;
    }

    const uuid = uuidv4();
    let { centerX, centerY } = fastboardApp.manager.cameraState;

    if (coord) {
        const rect = fastboardApp.manager.mainView.divElement?.getBoundingClientRect();
        if (rect) {
            ({ x: centerX, y: centerY } = fastboardApp.manager.mainView.convertToPointInWorld({
                x: coord.clientX - rect.left,
                y: coord.clientY - rect.top,
            }));
        }
    }

    width *= scale;
    height *= scale;
    fastboardApp.manager.mainView.insertImage({
        uuid,
        centerX,
        centerY,
        width: Math.floor(width),
        height: Math.floor(height),
        locked: false,
    });

    fastboardApp.manager.mainView.completeImageUpload(uuid, file.fileURL);

    // Prevent scale.
    // // 2. move camera to fit image height
    // width /= 0.8;
    // height /= 0.8;
    // fastboardApp.manager.moveCameraToContain({
    //     originX: centerX - width / 2,
    //     originY: centerY - height / 2,
    //     width: width,
    //     height: height,
    // });

    fastboardApp.manager.mainView.setMemberState({ currentApplianceName: ApplianceNames.selector });
}

export async function insertMedia(file: CloudFile, fastboardApp: FastboardApp): Promise<void> {
    await fastboardApp.manager.addApp({
        kind: "Plyr",
        options: {
            title: file.fileName,
        },
        attributes: {
            src: file.fileURL,
        },
    });
}

export async function insertDocs(
    file: CloudFile,
    fastboardApp: FastboardApp,
    flatI18n: FlatI18n,
    toaster: Toaster,
): Promise<void> {
    const convertingStatus = await queryConvertingTaskStatus({
        taskUUID: file.taskUUID,
        taskToken: file.taskToken,
        dynamic: isPPTX(file.fileName),
        region: file.region,
        projector: file.resourceType === "WhiteboardProjector",
    });

    if (convertingStatus.status === "Fail") {
        toaster.emit("error", flatI18n.t("unable-to-insert-courseware"));
        return;
    }

    if (convertingStatus.status !== "Finished") {
        toaster.emit("warn", flatI18n.t("in-the-process-of-transcoding-tips"));
        return;
    }

    if (convertingStatus.progress) {
        const scenes: SceneDefinition[] = convertingStatus.progress.convertedFileList.map(
            (f, i) => ({
                name: `${i + 1}`,
                ppt: {
                    src: f.conversionFileUrl,
                    width: f.width,
                    height: f.height,
                    previewURL: f.preview,
                },
            }),
        );

        const uuid = uuidv4();
        const scenePath = `/${file.taskUUID}/${uuid}`;

        const legacySlideParams = extractLegacySlideParams(scenes);

        if (legacySlideParams) {
            // legacy PPTX conversion
            await fastboardApp.manager.addApp({
                kind: "Slide",
                options: {
                    scenePath,
                    title: file.fileName,
                    scenes: scenes.map(s => ({ name: s.name })),
                },
                attributes: legacySlideParams,
            });
        } else {
            // other docs
            await fastboardApp.manager.addApp({
                kind: BuiltinApps.DocsViewer,
                options: {
                    scenePath,
                    title: file.fileName,
                    scenes,
                },
            });
        }
        return;
    }

    if (convertingStatus.prefix) {
        // new Projector PPTX conversion
        await fastboardApp.insertDocs({
            fileType: "pptx",
            title: file.fileName,
            scenePath: `/${file.taskUUID}/${uuidv4()}`,
            taskId: file.taskUUID,
            url: convertingStatus.prefix,
        });
    }
}

function extractLegacySlideParams(
    scenes: SceneDefinition[],
): { taskId: string; url: string } | null {
    // e.g. "ppt(x)://cdn/prefix/dynamicConvert/{taskId}/1.slide"
    const pptSrcRE = /^pptx?(?<prefix>:\/\/\S+?dynamicConvert)\/(?<taskId>\w+)\//;

    for (let i = 0; i < scenes.length; i++) {
        const ppt = scenes[i].ppt;
        if (ppt) {
            const match = pptSrcRE.exec(ppt.src);
            if (match && match.groups) {
                const { taskId, prefix } = match.groups;
                if (taskId && prefix) {
                    return { taskId, url: prefix };
                }
            }
        }
    }

    return null;
}

export async function insertZippedH5(file: CloudFile, fastboardApp: FastboardApp): Promise<void> {
    const CLOUD_STORAGE_DOMAIN = process.env.CLOUD_STORAGE_DOMAIN;
    if (!CLOUD_STORAGE_DOMAIN) {
        throw new Error("Missing env CLOUD_STORAGE_DOMAIN");
    }

    const src =
        CLOUD_STORAGE_DOMAIN.replace("[region]", file.region) +
        new URL(file.fileURL).pathname.replace(/[^/]+$/, "") +
        "resource/index.html";

    await fastboardApp.manager.addApp({
        kind: "IframeBridge",
        options: {
            title: file.fileName,
        },
        attributes: {
            src,
        },
    });
}

export async function insertVf(file: CloudFile, fastboardApp: FastboardApp): Promise<void> {
    await fastboardApp.manager.addApp({
        kind: "IframeBridge",
        options: {
            title: file.fileName,
        },
        attributes: {
            src: file.fileURL,
        },
    });
}
