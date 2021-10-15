import "./style.less";

import { message } from "antd";
import { v4 as v4uuid } from "uuid";
import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { WhiteboardStore } from "../../stores/whiteboard-store";
import { CloudStorageStore, CloudStorageFile } from "./store";
import { queryConvertingTaskStatus } from "../../api-middleware/courseware-converting";
import { convertFinish } from "../../api-middleware/flatServer/storage";
import { useIsomorphicLayoutEffect } from "react-use";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { SceneDefinition } from "white-web-sdk";
import { useTranslation } from "react-i18next";
import { RequestErrorCode } from "../../constants/error-code";
import { ServerRequestError } from "../../utils/error/server-request-error";

export interface CloudStoragePageProps {
    compact?: boolean;
    /** only works in compact mode */
    whiteboard?: WhiteboardStore;
    onCoursewareInserted?: () => void;
}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage({
    compact = false,
    whiteboard,
    onCoursewareInserted,
}) {
    const { t, i18n } = useTranslation();
    const [store] = useState(() => new CloudStorageStore({ compact, insertCourseware, i18n }));

    useEffect(() => store.initialize(), [store]);

    // @TODO clean logic
    useIsomorphicLayoutEffect(() => {
        store.insertCourseware = insertCourseware;
    });

    return compact ? (
        <CloudStorageContainer store={store} />
    ) : (
        <MainPageLayoutContainer>
            <CloudStorageContainer store={store} />
        </MainPageLayoutContainer>
    );

    async function insertCourseware(file: CloudStorageFile): Promise<void> {
        if (file.convert === "converting") {
            void message.warn(t("in-the-process-of-transcoding-tips"));
            return;
        }

        void message.info(t("Inserting-courseware-tips"));

        const ext = (/\.[^.]+$/.exec(file.fileName) || [""])[0].toLowerCase();
        switch (ext) {
            case ".jpg":
            case ".jpeg":
            case ".png":
            case ".webp": {
                await insertImage(file);
                break;
            }
            case ".mp3":
            case ".mp4": {
                insertMediaFile(file);
                break;
            }
            case ".doc":
            case ".docx":
            case ".ppt":
            case ".pptx":
            case ".pdf": {
                await insertDocs(file, ext);
                break;
            }
            default: {
                console.log(
                    `[cloud storage]: insert unknown format "${file.fileName}" into whiteboard`,
                );
            }
        }

        if (onCoursewareInserted) {
            onCoursewareInserted();
        }
    }

    async function insertImage(file: CloudStorageFile): Promise<void> {
        await whiteboard?.switchMainViewToWriter();

        const room = whiteboard?.room;
        if (!room) {
            return;
        }

        // shrink the image a little to fit the screen
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;

        let width: number;
        let height: number;

        if (file.fileURL) {
            ({ width, height } = await new Promise<{ width: number; height: number }>(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () =>
                    resolve({ width: window.innerWidth, height: window.innerHeight });
                img.src = file.fileURL;
            }));
        } else {
            ({ innerWidth: width, innerHeight: height } = window);
        }

        let scale = 1;
        if (width > maxWidth || height > maxHeight) {
            scale = Math.min(maxWidth / width, maxHeight / height);
        }

        const uuid = v4uuid();
        room.insertImage({
            uuid,
            ...room.state.cameraState,
            width: Math.floor(width * scale),
            height: Math.floor(height * scale),
            locked: false,
        });
        room.completeImageUpload(uuid, file.fileURL);
    }

    function insertMediaFile(file: CloudStorageFile): void {
        whiteboard?.openMediaFileInWindowManager(file.fileURL, file.fileName);
    }

    async function insertDocs(file: CloudStorageFile, ext: string): Promise<void> {
        const room = whiteboard?.room;
        if (!room) {
            return;
        }

        const { taskUUID, taskToken, region } = file;
        const dynamic = ext === ".pptx";
        const convertingStatus = await queryConvertingTaskStatus({
            taskUUID,
            taskToken,
            dynamic,
            region,
        });

        if (file.convert !== "success") {
            if (convertingStatus.status === "Finished" || convertingStatus.status === "Fail") {
                try {
                    await convertFinish({ fileUUID: file.fileUUID, region });
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
                    void message.error(
                        t("transcoding-failure-reason", { reason: convertingStatus.failedReason }),
                    );
                }
            } else {
                message.destroy();
                void message.warn(t("in-the-process-of-transcoding-tips"));
                return;
            }
        } else if (convertingStatus.status === "Finished" && convertingStatus.progress) {
            const scenes: SceneDefinition[] = convertingStatus.progress.convertedFileList.map(
                f => ({
                    name: v4uuid(),
                    ppt: {
                        src: f.conversionFileUrl,
                        width: f.width,
                        height: f.height,
                        previewURL: f.preview,
                    },
                }),
            );
            const uuid = v4uuid();
            const scenesPath = `/${taskUUID}/${uuid}`;
            whiteboard?.openDocsFileInWindowManager(scenesPath, file.fileName, scenes);
        } else {
            void message.error(t("unable-to-insert-courseware"));
        }
    }
});
