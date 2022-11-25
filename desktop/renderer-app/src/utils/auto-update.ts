import { IAutoUpdateContext } from "@netless/flat-pages/src/components/AutoUpdateContext";
import { UpdateCheckInfo, PrereleaseTag } from "flat-types/src/update";
import { ipcAsyncByApp, ipcReceive, ipcReceiveRemove, ipcSyncByApp } from "./ipc";

export const autoUpdate: IAutoUpdateContext = {
    getUpdateInfo(): Promise<UpdateCheckInfo | null> {
        return ipcSyncByApp("get-update-info").catch(err => {
            console.error("ipc failed", err);
            return null;
        });
    },
    startUpdate(prereleaseTag: PrereleaseTag): void {
        ipcAsyncByApp("start-update", { prereleaseTag });
    },
    onUpdateProgress(callback): () => void {
        ipcReceive("update-progress", callback);
        return () => ipcReceiveRemove("update-progress");
    },
};
