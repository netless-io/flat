import { app } from "electron";
import closeAPP from "../utils/CloseAPP";

export default () => {
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

    // Does not require sequential execution
    // Just to avoid local variables polluting Context variables
    [windowAllClosed, appQuit].forEach(f => {
        f();
    });
};
