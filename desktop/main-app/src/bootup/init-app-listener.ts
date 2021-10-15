import { app } from "electron";
import closeAPP from "../utils/close-app";

export default (): void => {
    const windowAllClosed = (): void => {
        app.on("window-all-closed", () => {
            closeAPP();
        });
    };

    const appQuit = (): void => {
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
