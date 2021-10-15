import { useEffect } from "react";
import { ipcAsyncByMainWindow } from "../ipc";

export function usePowerSaveBlocker(): void {
    useEffect(() => {
        ipcAsyncByMainWindow("set-prevent-sleep", { enable: true });
        return () => ipcAsyncByMainWindow("set-prevent-sleep", { enable: false });
    }, []);
}
