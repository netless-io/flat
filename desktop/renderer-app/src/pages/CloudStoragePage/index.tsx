import "./style.less";
import { message } from "antd";
import { v4 as v4uuid } from "uuid";
import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import MainPageLayout from "../../components/MainPageLayout";
import { WhiteboardStore } from "../../stores/WhiteboardStore";
import { CloudStorageStore, CloudStorageFile } from "./store";
import { queryConvertingTaskStatus } from "../../apiMiddleware/courseware-converting";
import { convertFinish } from "../../apiMiddleware/flatServer/storage";

export interface CloudStoragePageProps {
    compact?: boolean;
    /** only works in compact mode */
    whiteboard?: WhiteboardStore;
}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage({
    compact = false,
    whiteboard,
}) {
    const [store] = useState(() => new CloudStorageStore({ compact, insertCourseware }));

    useEffect(() => store.initialize(), [store]);

    return compact ? (
        <CloudStorageContainer store={store} />
    ) : (
        <MainPageLayout>
            <CloudStorageContainer store={store} />
        </MainPageLayout>
    );

    function insertCourseware(file: CloudStorageFile): void {
        if (file.convert === "converting") {
            message.warn("正在转码中，请稍后再试");
            return;
        }

        message.info("正在插入课件……");

        const ext = (/\.[^.]+$/.exec(file.fileName) || [""])[0].toLowerCase();
        switch (ext) {
            case ".jpg":
            case ".jpeg":
            case ".png":
            case ".webp": {
                insertImage(file);
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
            case ".ppt":
            case ".pptx":
            case ".pdf": {
                insertDocs(file, ext);
                break;
            }
            default: {
                console.log(
                    `[cloud storage]: insert unknown format "${file.fileName}" into whiteboard`,
                );
            }
        }
    }

    async function insertImage(file: CloudStorageFile): Promise<void> {
        const room = whiteboard?.room;
        if (!room) {
            return;
        }

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

        const uuid = v4uuid();
        room.insertImage({
            uuid,
            centerX: 0,
            centerY: 0,
            width,
            height,
            locked: false,
        });
        room.completeImageUpload(uuid, file.fileURL);
    }

    function insertAudio(_file: CloudStorageFile): void {
        // room.insertPlugin("audio", {
        //     originX: -240,
        //     originY: -43,
        //     width: 480,
        //     height: 86,
        //     attributes: {
        //         pluginAudioUrl: src,
        //     },
        // });
        console.log("[cloud storage] does not support audio yet");
    }

    function insertVideo(_file: CloudStorageFile): void {
        // room.insertPlugin("video", {
        //     originX: -240,
        //     originY: -135,
        //     width: 480,
        //     height: 270,
        //     attributes: {
        //         pluginAudioUrl: src,
        //     },
        // });
        console.log("[cloud storage] does not support video yet");
    }

    async function insertDocs(file: CloudStorageFile, ext: string): Promise<void> {
        const room = whiteboard?.room;
        if (!room) {
            return;
        }

        const { taskUUID, taskToken } = file;
        const dynamic = ext === ".pptx";
        const convertingStatus = await queryConvertingTaskStatus({ taskUUID, taskToken, dynamic });

        if (file.convert !== "success") {
            if (convertingStatus.status === "Finished" || convertingStatus.status === "Fail") {
                try {
                    await convertFinish({ fileUUID: file.fileUUID });
                } catch (e) {
                    console.error(e);
                }
                if (convertingStatus.status === "Fail") {
                    message.error(`转码失败，原因: ${convertingStatus.failedReason}`);
                }
            } else {
                message.destroy();
                message.warn("正在转码中，请稍后再试");
                return;
            }
        } else if (convertingStatus.status === "Finished" && convertingStatus.progress) {
            const scenes = convertingStatus.progress.convertedFileList.map(f => ({
                name: v4uuid(),
                ppt: {
                    width: f.width,
                    height: f.height,
                    src: f.conversionFileUrl,
                },
            }));
            const uuid = v4uuid();
            room.putScenes(`/${taskUUID}/${uuid}`, scenes);
            room.setScenePath(`/${taskUUID}/${uuid}/${scenes[0].name}`);
        } else {
            message.error("无法插入课件");
        }
    }
});
