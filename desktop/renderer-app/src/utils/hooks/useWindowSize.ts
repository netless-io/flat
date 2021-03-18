import { useEffect } from "react";
import { constants } from "flat-types";
import { ipcAsyncByMainWindow } from "../ipc";

export function useWindowSize(pageName: keyof typeof constants.PageSize): void {
    useEffect(() => {
        switch (pageName) {
            case "Main": {
                ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Main,
                });
                break;
            }
            case "Replay": {
                ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Replay,
                    resizable: true,
                    setMinimumSize: true,
                    maximizable: true,
                });
                break;
            }
            case "Class": {
                ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Class,
                    resizable: true,
                    setMinimumSize: true,
                    maximizable: true,
                });
                break;
            }
            case "Splash": {
                ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Splash,
                    autoCenter: true,
                });
                break;
            }
            case "Login": {
                ipcAsyncByMainWindow("set-win-size", {
                    ...constants.PageSize.Login,
                    autoCenter: true,
                });
                break;
            }
            default: {
                break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
