import { constants, portal } from "flat-types";
import { BrowserWindowConstructorOptions } from "electron";
import { WindowStore } from "./window-store";
import { CustomWindow, AbstractWindows } from "./abstract";

export class WindowManager<
    ABSTRACT_WINDOWS extends AbstractWindows = AbstractWindows,
> extends WindowStore<ABSTRACT_WINDOWS> {
    public constructor(wins: ABSTRACT_WINDOWS) {
        super(wins);
    }

    public create<NAME extends constants.WindowsName>(
        name: NAME,
        option?: BrowserWindowConstructorOptions,
    ): NonNullable<ABSTRACT_WINDOWS[NAME]["win"]> {
        const customWindow = this.wins[name].create(option || {});

        this.interceptPortalNewWindow(customWindow);

        return customWindow as NonNullable<ABSTRACT_WINDOWS[NAME]["win"]>;
    }

    public remove(name: constants.WindowsName): void {
        this.wins[name].remove();
    }

    private interceptPortalNewWindow(customWindow: CustomWindow): void {
        customWindow.window.webContents.on(
            "new-window",
            (event, _url, frameName, _disposition, options) => {
                if (!frameName.startsWith(constants.Portal)) {
                    return;
                }

                event.preventDefault();

                const customOptions: portal.Options = JSON.parse(
                    frameName.substring(constants.Portal.length),
                );

                // @ts-ignore
                event.newGuest = this.create(customOptions.name, options).window;
            },
        );
    }
}
