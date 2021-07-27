import { autoUpdater, UpdateCheckResult } from "electron-updater";
import runtime from "./Runtime";
import { ProgressInfo } from "electron-updater/out/differentialDownloader/ProgressDifferentialDownloadCallbackTransform";
import { ipcEmitByMain } from "./IPCEmit";
import { update } from "flat-types";

class UpdateService {
    private cancellationToken: UpdateCheckResult["cancellationToken"];

    public check(prereleaseTag: update.PrereleaseTag): Promise<update.UpdateCheckInfo> {
        autoUpdater.autoDownload = false;
        UpdateService.setUpdateURL(prereleaseTag);

        return new Promise((resolve, reject) => {
            const updateAvailable = (info: UpdateCheckResult["updateInfo"]) => {
                removeListeners();

                return resolve({
                    hasNewVersion: true,
                    version: info.version,
                    releaseNotes:
                        typeof info.releaseNotes === "string"
                            ? JSON.parse(info.releaseNotes)
                            : undefined,
                    prereleaseTag,
                });
            };

            const updateNotAvailable = () => {
                removeListeners();
                return resolve({
                    hasNewVersion: false,
                });
            };

            const error = (err: Error) => {
                removeListeners();
                reject(err);
            };

            autoUpdater.once("update-available", updateAvailable);
            autoUpdater.once("update-not-available", updateNotAvailable);
            autoUpdater.once("error", error);

            const removeListeners = () => {
                autoUpdater.removeListener("update-available", updateAvailable);
                autoUpdater.removeListener("update-not-available", updateNotAvailable);
                autoUpdater.removeListener("error", error);
            };

            autoUpdater.checkForUpdates().catch(err => {
                reject(err);
            });
        });
    }

    public update(prereleaseTag: update.PrereleaseTag): void {
        autoUpdater.autoDownload = true;

        // must be set to false here
        // because quitAndInstall is also called inside the code. see: https://github.com/electron-userland/electron-builder/blob/29e794d4fa42f8dcb3fafee8c0fa55e9b367de6c/packages/electron-updater/src/MacUpdater.ts#L130-L133
        // when called multiple times, an error will be triggered:
        //     Error: The command is disabled and cannot be executed
        //     domain: 'RACCommandErrorDomain'
        autoUpdater.autoInstallOnAppQuit = false;

        UpdateService.setUpdateURL(prereleaseTag);

        const updateNotAvailable = () => {
            removeListeners();
        };

        const downloadProgress = ({
            total,
            transferred,
            percent,
            bytesPerSecond,
        }: ProgressInfo) => {
            ipcEmitByMain("update-progress", {
                status: true,
                total,
                transferred,
                percent,
                bytesPerSecond,
            });
        };

        const updateDownloaded = () => {
            removeListeners();
            autoUpdater.quitAndInstall();
        };

        const error = (err: Error) => {
            removeListeners();
            console.error(err.message);

            ipcEmitByMain("update-progress", {
                status: false,
            });
        };

        autoUpdater.once("update-not-available", updateNotAvailable);
        autoUpdater.on("download-progress", downloadProgress);
        autoUpdater.once("update-downloaded", updateDownloaded);
        autoUpdater.once("error", error);

        const removeListeners = () => {
            autoUpdater.removeListener("update-not-available", updateNotAvailable);
            autoUpdater.removeListener("download-progress", downloadProgress);
            autoUpdater.removeListener("update-downloaded", updateDownloaded);
            autoUpdater.removeListener("error", error);
        };

        void autoUpdater
            .checkForUpdates()
            .then(d => {
                this.cancellationToken = d.cancellationToken;
            })
            .catch(error);
    }

    public cancel(): void {
        this.cancellationToken?.cancel();
    }

    private static setUpdateURL(prereleaseTag: update.PrereleaseTag): void {
        const osName = runtime.isWin ? "win" : "mac";
        const updateURL = `${process.env.UPDATE_DOMAIN}/latest/${prereleaseTag}/${osName}`;

        autoUpdater.setFeedURL({
            provider: "generic",
            url: updateURL,
            useMultipleRangeRequest: false,
        });
    }
}

export const updateService = new UpdateService();
