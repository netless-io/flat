import { app } from "electron";
import closeAPP from "../utils/CloseAPP";

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

    // Does not require sequential execution
    // Just to avoid local variables polluting Context variables
    [windowAllClosed, mainWindowReadyToShow, appQuit].forEach(f => {
        f();
    });
};
