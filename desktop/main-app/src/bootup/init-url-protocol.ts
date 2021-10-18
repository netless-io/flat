import runtime from "../utils/runtime";
import { app } from "electron";
import closeAPP from "../utils/close-app";
import { windowManager } from "../window-manager";
import { constants } from "flat-types";
import { CustomWindow } from "../window-manager/abstract";

export default async (): Promise<void> => {
    const protocol = new URLProtocolHandler({
        active: () => {
            // nothing...
        },
        joinRoom: (args, innerWindow) => {
            if (args.has("roomUUID")) {
                innerWindow.window.webContents.send("request-join-room", {
                    roomUUID: args.get("roomUUID"),
                });
            }
        },
    });

    if (runtime.isMac) {
        app.on("open-url", (event, url) => {
            event.preventDefault();

            protocol.execute(url);
        });
    }

    // requestSingleInstanceLock must be called after ready
    await app.whenReady();

    if (runtime.isWin) {
        // in any case, this must be called, otherwise second-instance will not be triggered
        const lock = app.requestSingleInstanceLock();

        const url = process.argv.slice().pop()!;

        // act of opening by url protocol should not launch a new app (except for the first open)
        if (url.startsWith("x-agora-flat-client://") && !lock) {
            return closeAPP();
        }

        protocol.execute(url);

        app.on("second-instance", (_event, command) => {
            protocol.execute(command.pop()!);
        });
    }
};

class URLProtocolHandler {
    public readonly handlers: ActionHandler;

    public constructor(handlers: ActionHandler) {
        this.handlers = Object.freeze(handlers);
    }

    public execute(url: string): void {
        const actionInfo = this.getActionInfo(url);

        if (actionInfo) {
            URLProtocolHandler.focus()
                .then(innerWindow => {
                    this.handlers[actionInfo.name](actionInfo.args, innerWindow);
                })
                .catch(() => {
                    // nothing..
                });
        }
    }

    private static async focus(): Promise<CustomWindow> {
        const innerWindow = await windowManager
            .customWindow(constants.WindowsName.Main)
            .assertWindow();

        const mainWindow = innerWindow.window;

        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }

        return innerWindow.didFinishLoad.then(() => innerWindow);
    }

    private getActionInfo(url: string): ActionInfo {
        try {
            const data = new URL(url);
            const actionName = data.hostname as ActionNames;

            if (!this.handlers[actionName]) {
                return null;
            }

            return {
                name: actionName,
                args: data.searchParams,
            };
        } catch (_err) {
            return null;
        }
    }
}

type ActionNames = "active" | "joinRoom";
type ActionHandler = {
    [key in ActionNames]: (arg: URLSearchParams, innerWindow: CustomWindow) => void;
};
type ActionInfo = {
    name: ActionNames;
    args: URLSearchParams;
} | null;
