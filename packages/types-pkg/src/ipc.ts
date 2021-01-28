import * as runtime from "./runtime";

export type ActionAsync = {
    "set-win-size": (args: { width: number; height: number; autoCenter?: boolean }) => void;
    "set-open-at-login": (args: { isOpenAtLogin: boolean }) => void;
};

export type ActionSync = {
    "get-runtime": () => runtime.Type;
    "get-open-at-login": () => boolean;
};
