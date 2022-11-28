import { ipc, update } from "flat-types";

export interface IAutoUpdateContext {
    getUpdateInfo(): Promise<update.UpdateCheckInfo | null>;
    startUpdate(prereleaseTag: update.PrereleaseTag): void;
    /** Returns a disposer that cancels this listener */
    onUpdateProgress(callback: (event: ipc.EmitEvents["update-progress"]) => void): () => void;
}
