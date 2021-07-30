import { copy, ensureDir, remove, pathExists } from "fs-extra";
import path from "path";
import { DownloaderHelper } from "node-downloader-helper";
import { runtime } from "./runtime";
import { extractZIP } from "./unzip";

type TaskUUID = string;
type TaskType = "dynamic" | "static";

function getCoursewareDir(taskUUID: string, taskType: TaskType): string {
    return path.join(runtime.downloadsDirectory, `${taskType}Convert`, taskUUID);
}

type PPTInfo = {
    baseURL: string;
    taskType: TaskType;
    taskUUID: string;
};

/**
 * Preload courseware
 */
class CoursewarePreloader {
    public downloaders = new Map<TaskUUID, DownloaderHelper>();

    public parsePPTURLInfo(pptSrc: string): PPTInfo {
        const pptFiles = /^(\S+)\/(static|dynamic)Convert\/([0-9a-f]{32})\//.exec(pptSrc);
        if (!pptFiles) {
            throw new Error("parse ppt url failed.");
        }
        const [, baseURL, taskType, taskUUID] = pptFiles;

        return {
            baseURL: baseURL.replace(/^pptx:\/\//, "https://"),
            taskType: taskType as TaskType,
            taskUUID,
        };
    }

    public async preload(pptSrc: string): Promise<void> {
        const { baseURL, taskType, taskUUID } = this.parsePPTURLInfo(pptSrc);

        if (this.downloaders.has(taskUUID) || (await this.has(taskUUID, taskType))) {
            return;
        }

        const url = `${baseURL}/${taskType}Convert/${taskUUID}.zip`;
        const coursewareDir = getCoursewareDir(taskUUID, taskType);
        const tempCoursewareDir = path.join(coursewareDir, taskUUID);

        await ensureDir(runtime.downloadsDirectory);

        const downloader = new DownloaderHelper(url, runtime.downloadsDirectory, {
            override: true,
        });
        this.downloaders.set(taskUUID, downloader);

        // download.onProgress(({ progress }) => {
        //     console.log("[preloader] downloading", taskUUID, progress);
        // });

        downloader.once("error", error => {
            console.error("[preloader] error", error);
            this.downloaders.delete(taskUUID);
        });

        downloader.once("end", async info => {
            try {
                await extractZIP(info.filePath, coursewareDir);
                // TODO: the convert service may fail in some cases, which
                //       results in incorrect zip structure.
                //       when it occurs, we manually correct it by code below.
                if (await pathExists(tempCoursewareDir)) {
                    await copy(tempCoursewareDir, coursewareDir);
                    await remove(tempCoursewareDir);
                }
                await remove(info.filePath);
            } catch (e) {
                console.error(e);
            }
            if (process.env.NODE_ENV === "development") {
                console.log("downloaded", info.filePath);
            }
            this.downloaders.delete(taskUUID);

            if (process.env.NODE_ENV === "development") {
                console.log("[preloader] download complete", coursewareDir);
            }
        });

        await downloader.start();
        if (process.env.NODE_ENV === "development") {
            console.log("[preloader] download started", taskUUID, taskType);
        }
    }

    public has(taskUUID: string, taskType: TaskType): Promise<boolean> {
        return pathExists(getCoursewareDir(taskUUID, taskType));
    }

    public async remove(taskUUID: string, taskType: TaskType): Promise<void> {
        const downloader = this.downloaders.get(taskUUID);
        if (downloader) {
            try {
                await downloader.stop();
            } catch (e) {
                console.error(e);
            }
            this.downloaders.delete(taskUUID);
        } else if (await this.has(taskUUID, taskType)) {
            await remove(getCoursewareDir(taskUUID, taskType));
        }
    }
}

let coursewarePreloader: CoursewarePreloader | undefined;

export function getCoursewarePreloader(): CoursewarePreloader {
    return (coursewarePreloader ??= new CoursewarePreloader());
}
