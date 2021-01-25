import * as runtime from "./runtime";

export type ActionAsync = {
    "set-win-size": (args: { width: number; height: number; autoCenter?: boolean }) => void;
    "open-at-login": (args: { isOpenAtLogin: boolean }) => void;
};

export type ActionSync = {
    "get-runtime": () => runtime.Type;
};
