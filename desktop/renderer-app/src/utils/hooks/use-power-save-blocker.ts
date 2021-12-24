import { useEffect } from "react";
import { ipcAsyncByApp } from "../ipc";

export function usePowerSaveBlocker(): void {
    useEffect(() => {
        ipcAsyncByApp("set-prevent-sleep", { enable: true });
        return () => ipcAsyncByApp("set-prevent-sleep", { enable: false });
    }, []);
}
