import * as runtime from "../runtime";

export type WindowActionAsync = {
    "set-win-size": (args: {
        width: number;
        height: number;
        autoCenter?: boolean;
        resizable?: boolean;
        setMinimumSize?:
            | true
            | {
                  minWidth: number;
                  minHeight: number;
              };
        maximizable?: boolean;
    }) => void;
    "disable-window": (args: { disable: boolean }) => void;
    "set-title": (args: { title: string }) => void;
    "set-prevent-sleep": (args: { enable: boolean }) => void;
};

export type AppActionAsync = {
    "set-open-at-login": (args: { isOpenAtLogin: boolean }) => void;
};

export type AppActionSync = {
    "get-runtime": () => runtime.Type;
    "get-open-at-login": () => boolean;
};

export interface EmitEvents {
    "window-will-close": {};
}
