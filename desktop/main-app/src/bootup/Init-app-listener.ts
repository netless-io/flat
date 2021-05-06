import { app } from "electron";
import closeAPP from "../utils/CloseAPP";
import { windowManager } from "../utils/WindowManager";

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

    const macOSopenURL = () => {
        app.on("open-url", event => {
            event.preventDefault();
            const mainWindow = windowManager.getMainWindow()?.window;
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
            }
        });
    };

    const windowsOpenURL = () => {
        const lock = app.requestSingleInstanceLock();
        if (!lock) {
            app.quit();
        } else {
            app.on("second-instance", () => {
                const mainWindow = windowManager.getMainWindow()?.window;
                if (mainWindow) {
                    if (mainWindow.isMinimized()) {
                        mainWindow.restore();
                    }
                    mainWindow.focus();
                } else {
                    if (process.platform !== "win32") {
                        if (app.isReady()) {
                            windowManager.createMainWindow();
                        }
                    }
                }
            });
        }
    };

    // Does not require sequential execution
    // Just to avoid local variables polluting Context variables
    [windowAllClosed, appQuit, macOSopenURL, windowsOpenURL].forEach(f => {
        f();
    });
};
