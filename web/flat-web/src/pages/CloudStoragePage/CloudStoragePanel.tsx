import "./style.less";

import { message } from "antd";
import { v4 as v4uuid } from "uuid";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { WhiteboardStore } from "../../stores/WhiteboardStore";
import { CloudStorageStore, CloudStorageFile } from "./store";
import { queryConvertingTaskStatus } from "../../apiMiddleware/courseware-converting";
import { convertFinish } from "../../apiMiddleware/flatServer/storage";
import { useIsomorphicLayoutEffect } from "react-use";
import { RoomPhase, SceneDefinition } from "white-web-sdk";
import { CloudStorageContainer } from "flat-components";
import { useTranslation } from "react-i18next";
import { RequestErrorCode } from "../../constants/ErrorCode";
import { ServerRequestError } from "../../utils/error/ServerRequestError";

export interface CloudStoragePanelProps {
    whiteboard?: WhiteboardStore;
    onCoursewareInserted?: () => void;
}

export const CloudStoragePanel = observer<CloudStoragePanelProps>(function CloudStoragePanel({
    whiteboard,
    onCoursewareInserted,
}) {
    const { t, i18n } = useTranslation();
    const [store] = useState(
        () => new CloudStorageStore({ compact: true, insertCourseware, i18n }),
    );

    useEffect(() => store.initialize(), [store]);

    // @TODO clean logic
    useIsomorphicLayoutEffect(() => {
        store.insertCourseware = insertCourseware;
    });

    return <CloudStorageContainer store={store} />;

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
            case ".mp3": {
                insertAudio(file);
                break;
            }
            case ".mp4": {
                insertVideo(file);
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

    function insertAudio(file: CloudStorageFile): void {
        const room = whiteboard?.room;
        if (!room) {
            return;
        }

        room.insertPlugin("video.js", {
            originX: -240,
            originY: -43,
            width: 480,
            height: 86,
            attributes: { src: file.fileURL },
        });
    }

    function insertVideo(file: CloudStorageFile): void {
        const room = whiteboard?.room;
        if (!room) {
            return;
        }

        room.insertPlugin("video.js", {
            originX: -240,
            originY: -135,
            width: 480,
            height: 270,
            attributes: { src: file.fileURL },
        });
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
                        width: f.width,
                        height: f.height,
                        src: f.conversionFileUrl,
                        previewURL: f.preview,
                    },
                }),
            );
            const uuid = v4uuid();
            room.putScenes(`/${taskUUID}/${uuid}`, scenes);
            room.setScenePath(`/${taskUUID}/${uuid}/${scenes[0].name}`);
            if (room.phase === RoomPhase.Connected) {
                room.scalePptToFit();
            }
        } else {
            void message.error(t("unable-to-insert-courseware"));
        }
    }
});
