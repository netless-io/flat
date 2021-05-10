import { app } from "electron";
import closeAPP from "../utils/CloseAPP";
import { URLProtocol } from "../utils/URLProtocol";

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
    [windowAllClosed, appQuit, URLProtocol].forEach(f => {
        f();
    });
};
