import { app } from "electron";
import closeAPP from "../utils/CloseAPP";
import { ipcEmitByMain } from "../utils/IPCEmit";
import { windows } from "../storage/Windows";

export default (context: Context) => {
    const windowAllClosed = () => {
        app.on("window-all-closed", () => {
            closeAPP();
        });
    };

    const appQuit = () => {
        app.on("quit", () => {
            closeAPP();
        });
    };

    const mainWindowReadyToShow = () => {
        context.wins.main.once("ready-to-show", () => {
            context.wins.main.show();
        });
    };

    const mainWindowWillClose = () => {
        context.wins.main.on("close", e => {
            if (!windows.mainState.realClose) {
                e.preventDefault();
                ipcEmitByMain("window-will-close", {});
            }
        });
    };

    // Does not require sequential execution
    // Just to avoid local variables polluting Context variables
    [windowAllClosed, mainWindowReadyToShow, appQuit, mainWindowWillClose].forEach(f => {
        f();
    });
};
