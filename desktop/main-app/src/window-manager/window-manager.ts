import { constants, portal } from "flat-types";
import { BrowserWindowConstructorOptions } from "electron";
import { WindowStore } from "./window-store";
import { CustomWindow, AbstractWindows } from "./abstract";
import { injectionWindowIPCAction } from "../utils/ipc-actions";

export class WindowManager<
    ABSTRACT_WINDOWS extends AbstractWindows,
> extends WindowStore<ABSTRACT_WINDOWS> {
    public constructor(wins: ABSTRACT_WINDOWS) {
        super(wins);
    }

    public create<NAME extends constants.WindowsName>(
        name: NAME,
        option?: BrowserWindowConstructorOptions,
    ): CustomWindow {
        const customWindow = this.wins[name].create(option || {});

        this.interceptPortalNewWindow(customWindow);

        injectionWindowIPCAction(customWindow);

        return customWindow;
    }

    public remove(customWindow: CustomWindow): void {
        this.wins[customWindow.options.name].remove(customWindow);
    }

    private interceptPortalNewWindow(customWindow: CustomWindow): void {
        customWindow.window.webContents.addListener(
            "new-window",
            (event, _url, frameName, _disposition, options) => {
                if (!frameName.startsWith(constants.Portal)) {
                    return;
                }

                event.preventDefault();

                const customOptions: portal.Options = JSON.parse(
                    frameName.substring(constants.Portal.length),
                );

                const window = this.create(customOptions.name, options).window;

                event.newGuest = window;

                window.webContents
                    .executeJavaScript(`window.browserWindowID = ${window.id}`)
                    .catch(console.error);
            },
        );
    }
}
