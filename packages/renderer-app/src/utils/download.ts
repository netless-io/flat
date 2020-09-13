import path from "path";
import { existsSync, ensureDirSync } from "fs-extra";
import {
    DownloaderError,
    DownloaderHelper,
    FinalDownloadInfo,
    Stats,
} from "node-downloader-helper";
import { runtime } from "./runtime";

export class DownloadFile {
    private readonly url: string;
    private readonly downloadDIR: string = runtime.downloadsDirectory;
    private readonly dl: DownloaderHelper | undefined = undefined;

    constructor(url: string, dir?: string) {
        this.url = url;

        if (dir) {
            this.downloadDIR = dir;
        }

        // 确保文件夹目录存在
        ensureDirSync(this.downloadDIR);

        this.dl = new DownloaderHelper(this.url, this.downloadDIR, {
            override: true,
        });
    }

    /**
     * 监听文件下载进度
     * @param {function} progressCB - 进度回调
     */
    public onProgress(progressCB: (progress: Stats) => any): void {
        this.dl?.on("progress", p => progressCB(p));
    }

    /**
     * 监听文件下载完成
     * @param {function} endCB - 结束回调
     */
    public onEnd(endCB: (end: FinalDownloadInfo) => any): void {
        this.dl?.on("end", d => {
            endCB(d);
        });
    }

    /**
     * 监听文件是否下载失败
     * @param {function} errorCB - 失败回调
     */
    public onError(errorCB: (error: DownloaderError | Error) => any): void {
        this.dl?.on("error", e => errorCB(e));
    }

    /**
     * 开始下载
     */
    public start(): void {
        this.dl?.start();
    }

    /**
     * 检测文件是否存在
     * @param {string} filename - 要检测的文件名
     */
    public fileIsExists(filename: string): boolean {
        return existsSync(path.join(this.downloadDIR, filename));
    }
}
