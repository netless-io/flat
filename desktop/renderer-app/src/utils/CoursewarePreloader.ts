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

/**
 * Preload courseware
 */
class CoursewarePreloader {
    downloaders = new Map<TaskUUID, DownloaderHelper>();

    async preload(taskUUID: string, taskType: TaskType): Promise<void> {
        if (this.downloaders.has(taskUUID) || (await this.has(taskUUID, taskType))) {
            return;
        }

        const url = `https://convertcdn.netless.link/${taskType}Convert/${taskUUID}.zip`;
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
                await copy(tempCoursewareDir, coursewareDir);
                await remove(tempCoursewareDir);
                await remove(info.filePath);
            } catch (e) {
                console.error(e);
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

    has(taskUUID: string, taskType: TaskType): Promise<boolean> {
        return pathExists(getCoursewareDir(taskUUID, taskType));
    }

    async remove(taskUUID: string, taskType: TaskType): Promise<void> {
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
