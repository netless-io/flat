import type { FlatPrefersColorScheme } from "flat-components";
import type { PreferencesStore } from "../preferences-store";

import { autorun } from "mobx";

interface IPC {
    send(
        windowID: "Main",
        payload: {
            actions: "set-theme";
            args: { theme: FlatPrefersColorScheme };
            browserWindowID: number;
        },
    ): void;
}

export function autoNativeTheme(preferences: PreferencesStore): void {
    if ((window as any).electron) {
        const ipc = (window as any).electron.ipcRenderer as IPC;
        autorun(() => {
            ipc.send("Main", {
                actions: "set-theme",
                args: { theme: preferences.prefersColorScheme },
                browserWindowID: NaN,
            });
        });
    }
}
