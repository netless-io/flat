import { app } from "electron";
import closeAPP from "./CloseAPP";
import runtime from "./Runtime";
import { windowManager } from "./WindowManager";

const actionHandler = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    active(_arg: URLSearchParams) {
        const mainWindow = windowManager.getMainWindow()?.window;
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    },

    open(arg: URLSearchParams) {
        const mainWindow = windowManager.getMainWindow()?.window;
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
            // x-agora-flat-client://open?join=room-uuid
            if (arg.has("join")) {
                mainWindow.webContents.send("join-room", { roomUUID: arg.get("join") });
            }
        }
    },
};

const mac = () => {
    app.on("open-url", (event, url) => {
        event.preventDefault();

        const urlInfo = parseURL(url);

        if (urlInfo) {
            actionHandler[urlInfo.action](urlInfo.arg);
        }
    });
};

const win = () => {
    // in any case, this must be called, otherwise second-instance will not be triggered
    const lock = app.requestSingleInstanceLock();

    const url = process.argv.slice().pop()!;

    // act of opening by url protocol should not launch a new app (except for the first open)
    if (url.startsWith("x-agora-flat-client://") && !lock) {
        return closeAPP();
    }

    const urlInfo = parseURL(url);

    if (urlInfo) {
        actionHandler[urlInfo.action](urlInfo.arg);
    }

    app.on("second-instance", (_event, command) => {
        const urlInfo = parseURL(command.pop()!);

        if (urlInfo) {
            actionHandler[urlInfo.action](urlInfo.arg);
        }
    });
};

const actions = ["active", "open"] as const;
type Actions = typeof actions[number];

const parseURL = (
    url: string,
): {
    action: Actions;
    arg: URLSearchParams;
} | null => {
    try {
        const data = new URL(url);
        const action = data.hostname as Actions;

        if (!actions.includes(action)) {
            return null;
        }

        return {
            action,
            arg: data.searchParams,
        };
    } catch (_err) {
        return null;
    }
};

export const URLProtocol = runtime.isMac ? mac : win;
