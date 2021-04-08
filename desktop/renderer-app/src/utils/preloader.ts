import { existsSync } from "fs";
import { copy, remove } from "fs-extra";
import path from "path";
import { DownloadFile } from "./download";
import { runtime } from "./runtime";
import { extractZIP } from "./unzip";

type TaskType = "dynamic" | "static";

function getDownloadDir(taskUUID: string, taskType: TaskType) {
    return path.join(runtime.downloadsDirectory, `${taskType}Convert`, taskUUID);
}

class Preloader {
    _deleted = new Set<string>();

    preload(taskUUID: string, taskType: TaskType) {
        const url = `https://convertcdn.netless.link/${taskType}Convert/${taskUUID}.zip`;
        const download = new DownloadFile(url);
        const downloadDir = getDownloadDir(taskUUID, taskType);
        const tempDownloadDir = path.join(downloadDir, taskUUID);
        download.onProgress(({ progress }) => {
            console.log("[preloader] downloading", taskUUID, progress);
        });
        download.onError(error => {
            console.log("[preloader] error", error);
        });
        download.onEnd(async info => {
            if (!this._deleted.has(`${taskType}/${taskUUID}`)) {
                await extractZIP(info.filePath, downloadDir);
                await copy(tempDownloadDir, downloadDir);
                await remove(tempDownloadDir);
            }
            await remove(info.filePath);
            this._deleted.delete(`${taskType}/${taskUUID}`);
        });
        download.start();
    }

    has(taskUUID: string, taskType: TaskType) {
        return existsSync(getDownloadDir(taskUUID, taskType));
    }

    async delete(taskUUID: string, taskType: TaskType) {
        if (this.has(taskUUID, taskType)) {
            await remove(getDownloadDir(taskUUID, taskType));
        } else {
            this._deleted.add(`${taskType}/${taskUUID}`);
        }
    }
}

let preloader: Preloader | undefined;
export function getPreloader() {
    return (preloader ??= new Preloader());
}
